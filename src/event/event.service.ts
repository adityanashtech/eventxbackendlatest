import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  ILike,
  LessThan,
  MoreThan,
  MoreThanOrEqual,
} from 'typeorm';
import { ApprovalStatus, Event } from './event.entity';
import { User } from '../user/user.entity';
import { UserEvent } from '../user-event/user-event.entity';
import * as Joi from 'joi';
import { isBefore, isValid, startOfDay } from 'date-fns';
import * as fs from 'fs';
import * as path from 'path';
import { CreateEventDto, UpdateEventDto } from './events.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>
  ) {}

  async createEvent(eventData: CreateEventDto) {
    const schema = Joi.object({
      user_id: Joi.number().required(),
      event_name: Joi.string().required(),
      location: Joi.string().required(),
      event_start_date: Joi.date().iso().required(),
      event_end_date: Joi.date().iso().required(),
      description: Joi.string().required(),
      registration_fee: Joi.number().required(),
      trending: Joi.boolean().required(),
      event_type: Joi.string().required(),
      image: Joi.string().optional(),
    });

    const { error, value } = schema.validate(eventData);
    if (error) {
      return { statusCode: 400, message: error.details[0].message };
    }

    const { user_id, event_name, event_start_date, event_end_date } = value;

    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      return { statusCode: 422, message: 'User does not exist with this id.' };
    }

    const startDateTime = new Date(event_start_date);
    const endDateTime = new Date(event_end_date);
    const currentDate = new Date();

    if (!isValid(startDateTime) || !isValid(endDateTime)) {
      return { statusCode: 422, message: 'Enter valid dates' };
    }

    if (isBefore(startDateTime, startOfDay(currentDate))) {
      return {
        statusCode: 422,
        message: 'Event start date cannot be in the past',
      };
    }

    if (isBefore(endDateTime, startOfDay(currentDate))) {
      return {
        statusCode: 422,
        message: 'Event end date cannot be in the past',
      };
    }

    if (isBefore(endDateTime, startDateTime)) {
      return {
        statusCode: 422,
        message: 'Event end date cannot be earlier than start date',
      };
    }

    const existingEvent = await this.eventRepository.findOne({
      where: { user_id, event_name, event_start_date: startDateTime },
    });

    if (existingEvent) {
      return { statusCode: 422, message: 'Event already exists' };
    }

    value.email = user.email;
    value.phone = user.phone;
    value.user_type = user.role;

    try {
      const savedEvent = await this.eventRepository.save(value);
      return {
        statusCode: 200,
        message: 'Event saved successfully',
        event: savedEvent,
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Error while saving event',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getEventById(id?: number, userId?: number) {
    if (id) {
      const event = await this.eventRepository.findOne({ where: { id } });

      if (!event) {
        return { statusCode: 422, message: 'No data found' };
      }

      let isRegister = false;
      if (userId) {
        const userEvent = await this.userEventRepository.findOne({
          where: { event: { id }, user: { id: userId } },
          relations: ['event', 'user'],
        });

        if (userEvent) {
          isRegister = true;
        }
      }

      return {
        statusCode: 200,
        message: 'Event found successfully',
        data: [{ ...event, is_register: isRegister }],
      };
    }

    const events = await this.eventRepository.find();
    return {
      statusCode: 200,
      message: 'All events retrieved successfully',
      data: events,
    };
  }

  async deleteEventById(id: number) {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.eventRepository.remove(event);
      return { statusCode: 200, message: 'Event deleted successfully' };
    } catch (error) {
      throw new HttpException(
        'Error deleting event',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateEvent(
    eventId: number,
    updateData: UpdateEventDto,
    isAdmin: boolean = false
  ): Promise<{ message: string; event?: Event; statusCode: number }> {
    const existingEvent = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!existingEvent) {
      throw new NotFoundException('Event not found');
    }

    const { event_start_date, event_end_date } = updateData;

    const currentDate = new Date();

    if (
      (event_start_date && !isValid(new Date(event_start_date))) ||
      (event_end_date && !isValid(new Date(event_end_date)))
    ) {
      throw new HttpException('Enter valid dates', HttpStatus.BAD_REQUEST);
    }

    if (
      event_start_date &&
      isBefore(startOfDay(new Date(event_start_date)), startOfDay(currentDate))
    ) {
      throw new HttpException(
        'Event start date cannot be in the past',
        HttpStatus.BAD_REQUEST
      );
    }

    if (
      event_end_date &&
      event_start_date &&
      isBefore(new Date(event_end_date), new Date(event_start_date))
    ) {
      throw new HttpException(
        'Event end date cannot be earlier than start date',
        HttpStatus.BAD_REQUEST
      );
    }

    if (!isAdmin && 'approval' in updateData) {
      throw new HttpException(
        'Forbidden. Only admin can access this.',
        HttpStatus.FORBIDDEN
      );
    }

    try {
      const filteredUpdateData = isAdmin
        ? updateData
        : Object.fromEntries(
            Object.entries(updateData).filter(([key]) => key !== 'approval')
          );
      await this.eventRepository.update(eventId, filteredUpdateData);
      const updatedEvent = await this.eventRepository.findOne({
        where: { id: eventId },
      });

      return {
        statusCode: 200,
        message: 'Event updated successfully',
        event: updatedEvent,
      };
    } catch (error) {
      throw new HttpException(
        'Error updating event',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getUserEvents(
    userId: number
  ): Promise<{ message: string; data?: any[]; statusCode: number }> {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const events = await this.eventRepository.find();
      const userEvents = await this.userEventRepository.find({
        where: { user: { id: userId } },
        relations: ['event'],
      });
      const userEventIds = userEvents.map((ue) => ue.event.id);

      const response = events.map((event) => ({
        ...event,
        is_registered: userEventIds.includes(event.id),
      }));

      return {
        statusCode: 200,
        message: 'Events fetched successfully',
        data: response,
      };
    } catch (error) {
      throw new HttpException(
        'Error fetching events',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async searchEvents(
    location?: string,
    name?: string,
    startDate?: string,
    endDate?: string,
    isAdmin: boolean = false
  ): Promise<{ message: string; data?: Event[]; statusCode: number }> {
    const query: any = {};
    if (location) {
      query.location = location;
    }

    if (name) {
      query.event_name = ILike(`%${name}%`);
    }

    if (startDate && endDate) {
      query.event_start_date = Between(startDate, endDate);
    }

    if (!isAdmin) {
      query.approval = ApprovalStatus.APPROVED;
    }

    const events = await this.eventRepository.find({
      where: query,
    });

    if (!events || events.length === 0) {
      return { statusCode: 422, message: 'No data found' };
    }

    return {
      statusCode: 200,
      message: 'Events found successfully',
      data: events,
    };
  }

  async findEvents(
    keyword?: string,
    type?: 'trending' | 'upcoming',
    isAdmin: boolean = false
  ): Promise<{
    statusCode: number;
    message: string;
    data?: Event[];
  }> {
    try {
      if (type && type !== 'trending' && type !== 'upcoming') {
        throw new BadRequestException(
          `Invalid type: '${type}'. Allowed values are 'trending' or 'upcoming'.`
        );
      }
      const query = this.eventRepository.createQueryBuilder('event');

      query.where('event.event_start_date >= CURRENT_DATE');

      if (keyword) {
        query.andWhere(
          `(event.event_name ILIKE :keyword OR event.location ILIKE :keyword OR event.event_type ILIKE :keyword)`,
          { keyword: `%${keyword}%` }
        );
      }

      if (type === 'trending') {
        query.andWhere('event.trending = :trending', { trending: true });
      }

      if (type === 'upcoming') {
        query.andWhere('event.event_start_date > CURRENT_DATE');
      }

      if (!isAdmin) {
        query.andWhere('event.approval = :approval', {
          approval: ApprovalStatus.APPROVED,
        });
      }

      query.orderBy('event.event_start_date', 'DESC');

      const events = await query.getMany();

      return {
        statusCode: 200,
        message: 'Fetched upcoming events successfully',
        data: events,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'An error occurred while searching for events.',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getEventsByStatus(
    type: string,
    isAdmin: boolean = false
  ): Promise<{
    statusCode: number;
    message: string;
    data?: Event[];
    count?: number;
  }> {
    const currentDate = new Date();
    const whereClause: Partial<Pick<Event, 'approval'>> = {};
    let events: Event[] = [];

    if (!isAdmin) {
      whereClause.approval = ApprovalStatus.APPROVED;
    }

    switch (type) {
      case 'past':
        events = await this.eventRepository.find({
          where: [
            {
              ...whereClause,
              event_start_date: LessThan(currentDate),
              event_end_date: LessThan(currentDate),
            },
          ],
        });
        break;
      case 'upcoming':
        events = await this.eventRepository.find({
          where: [
            {
              ...whereClause,
              event_start_date: MoreThan(currentDate),
              event_end_date: MoreThan(currentDate),
            },
          ],
        });
        break;
      case 'trending':
        events = await this.eventRepository.find({
          where: [
            {
              ...whereClause,
              trending: true,
              event_start_date: MoreThanOrEqual(currentDate),
              event_end_date: MoreThanOrEqual(currentDate),
            },
          ],
        });
        break;
      case 'all':
        events = await this.eventRepository.find({
          where: {
            ...whereClause,
          },
        });
        break;
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Invalid event type',
        };
    }

    const count = events.length;

    if (count > 0) {
      return {
        statusCode: HttpStatus.OK,
        message: 'Events found successfully',
        data: events,
        count: count,
      };
    } else {
      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'No data found',
        count: count,
      };
    }
  }

  async getEventTypes(): Promise<{
    message: string;
    data?: string[];
    statusCode: number;
  }> {
    try {
      const filePath = path.join(__dirname, '..', '..', 'src', 'helper.json');

      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found at path: ${filePath}`);
      }

      const fileContents = fs.readFileSync(filePath, 'utf-8');
      const events = JSON.parse(fileContents).events;

      return {
        statusCode: 200,
        message: 'Event types retrieved successfully',
        data: events,
      };
    } catch (error) {
      throw new HttpException(
        'Error reading helper.json file',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getEventsByCreator(userId: number): Promise<{
    statusCode: number;
    message: string;
    data?: Event[];
  }> {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const events = await this.eventRepository.find({
        where: { user_id: userId },
        order: {
          created_at: 'DESC',
        },
      });

      if (!events.length) {
        return {
          statusCode: HttpStatus.OK,
          message: 'No events found for this creator',
          data: [],
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'Events fetched successfully',
        data: events,
      };
    } catch (error) {
      throw new HttpException(
        'Error fetching events',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
