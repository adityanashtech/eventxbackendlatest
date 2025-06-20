import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Event } from '../event/event.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from './guards/auth.guard';
import { MailSender } from '../mailSender';

@Module({
  imports: [TypeOrmModule.forFeature([User, Event])],
  controllers: [UserController], // Declare the controller
  providers: [UserService, AuthGuard, MailSender], // Declare the service and other providers
  exports: [UserService], // Export the service if it needs to be used in other modules
})
export class UserModule {}
