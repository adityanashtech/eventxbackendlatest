import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Event } from '../event/event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
