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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  createEventSwagger,
  updateEventSwagger,
  getEventByIdSwagger,
  deleteEventByIdSwagger,
  getUserEventsSwagger,
  searchEventsSwagger,
  getEventTypeSwagger,
  getEventsByStatusSwagger,
  findEventsSwagger,
  getEventsByCreatorSwagger,
} from './event.swagger';
import { AuthGuard } from '../user/guards/auth.guard';
import { EventService } from './event.service';
import { UpdateEventDto } from './events.dto';
import { User } from 'src/user/decorators/user.decorator';

@ApiBearerAuth()
@Controller('events')
@ApiTags('events')
@UseGuards(AuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create_event')
  @createEventSwagger()
  async createEvent(@Body() eventData) {
    return this.eventService.createEvent(eventData);
  }

  @Get('search')
  @searchEventsSwagger()
  async searchEvents(
    @Query('location') location?: string,
    @Query('name') name?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.eventService.searchEvents(location, name, startDate, endDate);
  }

  @Get('status')
  @getEventsByStatusSwagger()
  async getEventByStatus(@Query('status') type: string) {
    return this.eventService.getEventsByStatus(type);
  }

  @Get('userEventList/:userId')
  @getUserEventsSwagger()
  async getUserEvents(@Param('userId') userId: number) {
    return this.eventService.getUserEvents(userId);
  }

  @Get('types/genre')
  @getEventTypeSwagger()
  async getEventTypes() {
    return this.eventService.getEventTypes();
  }

  @Get('find')
  @findEventsSwagger()
  async findEvents(
    @Query('keyword') keyword?: string,
    @Query('type') type?: 'trending' | 'upcoming'
  ) {
    return this.eventService.findEvents(keyword, type);
  }

  @Get(':id?')
  @getEventByIdSwagger()
  async getEventById(
    @Param('id') id?: number,
    @Query('user_id') userId?: number // Accept user_id as a query parameter
  ) {
    return this.eventService.getEventById(id, userId);
  }

  @Delete(':id')
  @deleteEventByIdSwagger()
  async deleteEventById(@Param('id') id: number) {
    this.eventService.deleteEventById(id);
  }

  @Patch(':id')
  @updateEventSwagger()
  async updateEventById(
    @Param('id') id: number,
    @Body() eventData: UpdateEventDto,
    @User('role') role: string
  ) {
    const isAdmin = role === 'admin';
    return this.eventService.updateEvent(id, eventData, isAdmin);
  }

  @Get('creator/:userId')
  @ApiBearerAuth()
  @getEventsByCreatorSwagger()
  async getEventsByCreator(@Param('userId') userId: number) {
    return this.eventService.getEventsByCreator(userId);
  }
}
