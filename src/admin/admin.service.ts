import { Injectable, HttpStatus, Body, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, LessThanOrEqual, MoreThanOrEqual, Between } from 'typeorm';
import { Event } from '../event/event.entity';
import { User } from '../user/user.entity';
import { startOfDay, subMonths, startOfMonth, endOfMonth, format } from 'date-fns';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getEventsByType(type: string): Promise<{ statusCode: number, message: string, data?: Event[], count?: number }> {
    const currentDate = new Date(); 
    let events: Event[] = [];

    switch (type) {
      case 'past':
        events = await this.eventRepository.find({
          where: [
            { event_start_date: LessThan(currentDate), event_end_date: LessThan(currentDate) },
          ],
        });
        break;
      case 'upcoming':
        events = await this.eventRepository.find({
          where: [
            { event_start_date: MoreThan(currentDate), event_end_date: MoreThan(currentDate) },
          ],
        });
        break;
        case 'trending':
          events = await this.eventRepository.find({
            where: [
              { trending: true, event_start_date: MoreThanOrEqual(currentDate), event_end_date: MoreThanOrEqual(currentDate) },
            ],
          });
          break;
      case 'all':
        events = await this.eventRepository.find();
        break;
      default:
        return { statusCode: HttpStatus.BAD_REQUEST, message: 'Invalid event type' };
    }

    const count = events.length;

    if (count > 0) {
      return { statusCode: HttpStatus.OK, message: 'Events found successfully', data: events, count: count };
    } else {
      return { statusCode: HttpStatus.UNPROCESSABLE_ENTITY, message: 'No data found', count: count };
    }
  }


  async updateStatusEvent(id: number,event_status: boolean): Promise<{ statusCode: number, message: string, event?: Event}> {
 
    try {
      const event = await this.eventRepository.update(id,{ "status": event_status });
      let updatedEvent: Event = await this.eventRepository.findOne({
        where: 
          { id:id }
      });
      
      console.log(updatedEvent)
      return { statusCode: 200, message: 'Event status updated successfully', event: updatedEvent };
    } catch (error) {
      throw new HttpException('Error updating event', HttpStatus.INTERNAL_SERVER_ERROR);
    }  
  }

  async getUserCreationStats(months: number = 6): Promise<{ statusCode: number; message: string; data?: any[] }> {
    try {
      const currentDate = new Date();
      const stats = [];

      for (let i = 0; i < months; i++) {
        const monthStart = startOfMonth(subMonths(currentDate, i));
        const monthEnd = endOfMonth(monthStart);

        const users = await this.userRepository.count({
          where: {
            created_at: Between(monthStart, monthEnd)
          }
        });

        stats.push({
          month: format(monthStart, 'MMM yyyy'),
          count: users
        });
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'User creation statistics retrieved successfully',
        data: stats.reverse() // Reverse to get chronological order
      };
    } catch (error) {
      throw new HttpException(
        'Error fetching user creation statistics',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
