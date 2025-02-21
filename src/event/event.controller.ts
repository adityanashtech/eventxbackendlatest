import { Controller, Post, Body, HttpStatus, HttpException, Get, Query, NotFoundException, Param, Delete, Put, Patch , UseGuards} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags, ApiBadRequestResponse, ApiProperty } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, ILike } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../user/user.entity';
import * as Joi from 'joi';
import { isBefore, isValid, startOfDay } from 'date-fns';
import { createEventSwagger, updateEventSwagger, getEventByIdSwagger, deleteEventByIdSwagger, getUserEventsSwagger, searchEventsSwagger, getEventTypeSwagger } from './event.swagger';
import { AuthGuard } from '../user/auth.guard';
import { UserEvent } from '../user-event/user-event.entity';
import * as fs from 'fs';
import * as path from 'path';

@Controller('events')
@ApiTags('events')
@UseGuards(AuthGuard)
export class EventController {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
  ) { }

  @Post('create_event')
  @createEventSwagger()
  async createEvent(@Body() eventData): Promise<{ message: string; event?: Event, statusCode: number }> {
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
      image: Joi.string().optional()
    });

    const { error, value } = schema.validate(eventData);
    if (error) {
      return {
        statusCode: 400,
        message: error.details[0].message,
      };
    }

    const { user_id, event_name, event_start_date, event_end_date } = value;

    let user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      return {
        statusCode: 422,
        message: "User does not exist with this id.",
      };
    }

    const currentDate = new Date();
    const startDateTime = new Date(event_start_date);
    const endDateTime = new Date(event_end_date);

  if (!isValid(startDateTime) || !isValid(endDateTime)) {
    return {
      statusCode: 422,
      message: "Enter valid dates",
    };
  }

  if (isBefore(startDateTime, startOfDay(currentDate))) {
    return {
      statusCode: 422,
      message: "Event start date cannot be in the past",
    };
  }

  if (isBefore(endDateTime, startOfDay(currentDate))) {
    return {
      statusCode: 422,
      message: "Event end date cannot be in the past",
    };
  }

  if (isBefore(endDateTime, startDateTime)) {
    return {
      statusCode: 422,
      message: "Event end date cannot be earlier than start date",
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
    const savedEvent: Event = await this.eventRepository.save(value);
    if (!savedEvent) {
      return { statusCode: 422, message: 'Event could not be saved', event: null };
    }
    return { statusCode: 200, message: 'Event saved successfully', event: savedEvent };
  } catch (error) {
    throw new HttpException('Error while saving event', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}





@Get(':id?')
@getEventByIdSwagger()
async getEventById(
  @Param('id') id?: number,
  @Query('user_id') userId?: number // Accept user_id as a query parameter
): Promise<{ message: string, data?: any[], statusCode: number }> {
  if (id) {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      return { statusCode: 422, message: 'No data found' };
    }

    let isRegister = false;

    if (userId) {
      const userEvent = await this.userEventRepository.findOne({
        where: {
          event: { id },    
          user: { id: userId } 
        },
        relations: ['event', 'user'],
      });

      if (userEvent) {
        isRegister = true;
      }
    }

    return { 
      statusCode: 200, 
      message: 'Event found successfully', 
      data: [{ ...event, is_register: isRegister }] 
    };
  } else {
      const events = await this.eventRepository.find();

      return { statusCode: 200, message: 'All events retrieved successfully', data: events };
    }
  }

  @Delete(':id')
  @deleteEventByIdSwagger()
  async deleteEventById(@Param('id') id: number): Promise<{ message: string, statusCode: number }> {
    const event = await this.eventRepository.findOne({ where: { id } });

    if (!event) {
      throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.eventRepository.remove(event);
      return { statusCode: 200, message: 'Event deleted successfully' };
    } catch (error) {
      throw new HttpException('Error deleting event', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


@Patch(':id')
@updateEventSwagger()
async updateEventById(@Param('id') id: number, @Body() eventData: any): Promise<{ message: string, event?: Event, statusCode: number }> {
  const schema = Joi.object({
    event_name: Joi.string().optional(),
    location: Joi.string().optional(),
    event_start_date: Joi.date().iso().optional(),
    event_end_date: Joi.date().iso().optional(),
    description: Joi.string().optional(),
    user_type: Joi.string().optional(),
    status: Joi.string().optional(),
    registration_fee: Joi.number().optional(),
    trending: Joi.boolean().optional(),
    event_type: Joi.string().optional(),
    image: Joi.string().optional()
  });

  const { error, value } = schema.validate(eventData);
  if (error) {
    return {
      statusCode: 400,
      message: error.details[0].message,
    };
  }

  const { event_start_date, event_end_date } = value;

  const currentDate = new Date();

  if ((event_start_date && !isValid(new Date(event_start_date))) || (event_end_date && !isValid(new Date(event_end_date)))) {
    return {
      statusCode: 422,
      message: "Enter valid dates",
    };
  }

  if (event_start_date && isBefore(startOfDay(new Date(event_start_date)), startOfDay(currentDate))) {
    return {
      statusCode: 422,
      message: "Event start date cannot be in the past",
    };
  }

  if (event_end_date && event_start_date && isBefore(new Date(event_end_date), new Date(event_start_date))) {
    return {
      statusCode: 422,
      message: "Event end date cannot be earlier than start date",
    };
  }

  const existingEvent = await this.eventRepository.findOne({
    where: { id },
  });

  if (!existingEvent) {
    return {
      statusCode: 404,
      message: 'Event not found',
    };
  }

  try {
    const updatedEvent = await this.eventRepository.save({ ...existingEvent, ...value });
    return { statusCode: 200, message: 'Event updated successfully', event: updatedEvent };
  } catch (error) {
    throw new HttpException('Error updating event', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}



  @Get('search')
  @searchEventsSwagger()
  async searchEvents(
    @Query('location') location?: string,
    @Query('name') name?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{ message: string, data?: Event[], statusCode: number }> {
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

    const events = await this.eventRepository.find({
      where: query,
    });

    if (!events || events.length === 0) {
      return { statusCode: 422, message: 'No data found' };
    }

    return { statusCode: 200, message: 'Events found successfully', data: events };
  }


  @Get('userEventList/:userId')
  @getUserEventsSwagger()
  async getUserEvents(@Param('userId') userId: number): Promise<{ message: string, data?: any[], statusCode: number }> {
    if (!userId) {
      throw new HttpException('User ID is required', HttpStatus.BAD_REQUEST);
    }

    try {
      const events = await this.eventRepository.find();
      const userEvents = await this.userEventRepository.find({ where: { user: { id: userId } }, relations: ['event'] });
      const userEventIds = userEvents.map(ue => ue.event.id);

      const response = events.map(event => ({
        ...event,
        is_registered: userEventIds.includes(event.id),
      }));
      
      return { statusCode: 200, message: 'Events fetched successfully', data: response };
    } catch (error) {
      throw new HttpException('Error fetching events', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('types/genre')
  @getEventTypeSwagger()
  async getEventTypes(): Promise<{ message: string; data?: string[]; statusCode: number }> {
    try {
      const filePath = path.join(__dirname,'..','..','src', 'helper.json');

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
      throw new HttpException('Error reading helper.json file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

