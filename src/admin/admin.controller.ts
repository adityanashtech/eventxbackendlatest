import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminService, EventTypeDistributionResponse } from './admin.service';
import {
  getEventsByTypeSwagger,
  updateApprovalSwagger,
  updateStatusEventSwagger,
  getUserStatsSwagger,
  getEventTypeDistributionSwagger,
} from './admin.swagger';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/user/guards/auth.guard';
import { RolesGuard } from 'src/user/guards/roles.guard';
import { Roles } from 'src/user/decorators/roles.decorator';
import { ApprovalStatus } from 'src/event/event.entity';
import { EventService } from 'src/event/event.service';

@Controller('admin')
@ApiTags('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly eventService: EventService
  ) {}

  @Get('events')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @getEventsByTypeSwagger()
  async getEventsByType(@Query('type') type: string) {
    return this.adminService.getEventsByType(type);
  }

  @Post('update-status')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @updateStatusEventSwagger()
  async updateStatusEvent(@Body() eventData) {
    return this.adminService.updateStatusEvent(eventData.id, eventData.status);
  }

  @Patch(':id/approval')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @updateApprovalSwagger()
  async updateAproval(
    @Param('id', ParseIntPipe) id: number,
    @Body('approval') approval: ApprovalStatus
  ) {
    return this.eventService.updateEvent(id, { approval }, true);
  }

  @Get('user-stats')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @getUserStatsSwagger()
  async getUserCreationStats(@Query('months') months?: number) {
    return this.adminService.getUserCreationStats(months);
  }

  @Get('event-type-distribution')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('admin')
  @getEventTypeDistributionSwagger()
  async getEventTypeDistribution(
    @Query('months') months?: number
  ): Promise<EventTypeDistributionResponse> {
    return this.adminService.getEventTypeDistribution(months);
  }
}
