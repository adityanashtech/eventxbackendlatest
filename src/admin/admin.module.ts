import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { Event } from "../event/event.entity";
import { EventService } from "src/event/event.service";
import { User } from "src/user/user.entity";
import { UserEvent } from "src/user-event/user-event.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, UserEvent])],
  controllers: [AdminController],
  providers: [AdminService, EventService],
})
export class AdminModule {}
