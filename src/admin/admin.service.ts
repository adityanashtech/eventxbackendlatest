import { Injectable, HttpStatus, Body, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Event } from '../event/event.entity';
import { startOfDay } from 'date-fns';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
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
}
