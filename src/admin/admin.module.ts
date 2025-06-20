import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Event } from '../event/event.entity';
import { User } from '../user/user.entity';
import { EventModule } from '../event/event.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User]), EventModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
