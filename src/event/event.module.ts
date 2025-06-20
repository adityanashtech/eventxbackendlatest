import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Event } from './event.entity';
import { User } from '../user/user.entity';
import { UserEvent } from '../user-event/user-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, UserEvent])],
  controllers: [EventController],
  providers: [EventService],
  exports: [EventService],
})
export class EventModule {}
