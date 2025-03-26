import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Delete,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Event } from "./event.entity";
import {
  createEventSwagger,
  updateEventSwagger,
  getEventByIdSwagger,
  deleteEventByIdSwagger,
  getUserEventsSwagger,
  searchEventsSwagger,
  getEventTypeSwagger,
  getEventsByStatusSwagger,
} from "./event.swagger";
import { AuthGuard } from "../user/auth.guard";
import { UserEvent } from "../user-event/user-event.entity";
import { EventService } from "./event.service";

@ApiBearerAuth()
@Controller("events")
@ApiTags("events")
@UseGuards(AuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post("create_event")
  @createEventSwagger()
  async createEvent(@Body() eventData) {
    return this.eventService.createEvent(eventData);
  }

  @Get("search")
  @searchEventsSwagger()
  async searchEvents(
    @Query("location") location?: string,
    @Query("name") name?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    return this.eventService.searchEvents(location, name, startDate, endDate);
  }

  @Get("status")
  @getEventsByStatusSwagger()
  async getEventByStatus(@Query("status") type: string) {
    return this.eventService.getEventsByStatus(type);
  }

  @Get("userEventList/:userId")
  @getUserEventsSwagger()
  async getUserEvents(@Param("userId") userId: number) {
    return this.eventService.getUserEvents(userId);
  }

  @Get("types/genre")
  @getEventTypeSwagger()
  async getEventTypes() {
    return this.eventService.getEventTypes();
  }

  @Get(":id?")
  @getEventByIdSwagger()
  async getEventById(
    @Param("id") id?: number,
    @Query("user_id") userId?: number // Accept user_id as a query parameter
  ) {
    return this.eventService.getEventById(id, userId);
  }

  @Delete(":id")
  @deleteEventByIdSwagger()
  async deleteEventById(@Param("id") id: number) {
    this.eventService.deleteEventById(id);
  }

  @Patch(":id")
  @updateEventSwagger()
  async updateEventById(@Param("id") id: number, @Body() eventData: any) {
    return this.eventService.updateEvent(id, eventData);
  }
}
