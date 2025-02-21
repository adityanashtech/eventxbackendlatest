import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { getEventsByTypeSwagger } from './admin.swagger'
import { ApiTags } from '@nestjs/swagger';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('events')
  @getEventsByTypeSwagger()
  async getEventsByType(@Query('type') type: string) {
    return this.adminService.getEventsByType(type);
  }

  @Post('update-status')
  async updateStatusEvent(@Body() eventData) {
    return this.adminService.updateStatusEvent(eventData.id,eventData.status);
  }
}