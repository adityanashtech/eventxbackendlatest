import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEvent } from './user-event.entity';
import { User } from '../user/user.entity';
import { Event } from '../event/event.entity';

@Injectable()
export class UserEventService {
  constructor(
    @InjectRepository(UserEvent)
    private readonly userEventRepository: Repository<UserEvent>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>
  ) {}

  async registerUserToEvent(
    user_id: number,
    event_id: number
  ): Promise<{ message: string; data?: UserEvent; statusCode: number }> {
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    if (!user) {
      return { statusCode: 422, message: `User with ID ${user_id} not found` };
    }

    const event = await this.eventRepository.findOne({
      where: { id: event_id },
    });
    if (!event) {
      return {
        statusCode: 422,
        message: `Event with ID ${event_id} not found`,
      };
    }
    const existingUserEvent = await this.userEventRepository.findOne({
      where: { user: { id: user_id }, event: { id: event_id } },
    });
    if (existingUserEvent) {
      return {
        statusCode: 409,
        message: `User with ID ${user_id} is already registered for event with ID ${event_id}`,
      };
    }

    const userEvent = this.userEventRepository.create({ user, event });
    const savedUserEvent = await this.userEventRepository.save(userEvent);

    return {
      statusCode: 200,
      message: 'User registered to event successfully',
      data: savedUserEvent,
    };
  }

  async getUserEvents(
    user_id: number,
    status: 'ongoing' | 'past' | 'upcoming' | 'all' = 'all'
  ): Promise<{ message: string; data?: any; statusCode: number }> {
    const user = await this.userRepository.findOne({ where: { id: user_id } });
    delete user.password;
    if (!user) {
      throw new NotFoundException(`User with ID ${user_id} does not exist`);
    }

    const [userEvents] = await this.userEventRepository.findAndCount({
      where: { user: { id: user_id } },
      relations: ['event'],
    });

    const now = new Date();

    const filteredEvents = userEvents
      .map((ue) => ue.event)
      .filter((event) => {
        const start = new Date(event.event_start_date);
        const end = new Date(event.event_end_date);

        switch (status) {
          case 'ongoing':
            return start <= now && end >= now;
          case 'upcoming':
            return start > now;
          case 'past':
            return end < now;
          default:
            return true;
        }
      });

    return {
      statusCode: 200,
      message: 'Events retrieved successfully',
      data: {
        users: user,
        event: filteredEvents,
        totalEventsCount: filteredEvents.length,
        status: status,
      },
    };
  }

  async getEventUsers(
    event_id: number
  ): Promise<{ message: string; data?: any; statusCode: number }> {
    const event = await this.eventRepository.findOne({
      where: { id: event_id },
    });
    if (!event) {
      return {
        statusCode: 422,
        message: `Event with ID ${event_id} does not exist`,
      };
    }

    const [users, count] = await this.userEventRepository.findAndCount({
      where: { event: { id: event_id } },
      relations: ['user'],
    });

    if (count === 0) {
      return {
        statusCode: 422,
        message: `No users found for event with ID ${event_id}`,
      };
    }

    const userData = users.map((userEvent) => {
      const user = userEvent.user;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        age: user.age,
        image: user.image,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    });

    return {
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: {
        event: event,
        users: userData,
        totalUserCount: count,
      },
    };
  }
}
