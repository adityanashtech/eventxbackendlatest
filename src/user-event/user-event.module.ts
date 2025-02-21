import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEvent } from './user-event.entity';
import { UserEventService } from './user-event.service';
import { UserEventController } from './user-event.controller';
import { User } from '../user/user.entity';
import { Event } from '../event/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEvent, User, Event])],
  providers: [UserEventService],
  controllers: [UserEventController],
})
export class UserEventModule {}
