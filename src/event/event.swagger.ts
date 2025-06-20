import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBadRequestResponse,
  ApiHeader,
  ApiParam,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CreateEventDto, UpdateEventDto } from './events.dto';

export const createEventSwagger = () => {
  return applyDecorators(
    ApiTags('events'),
    ApiHeader({
      name: 'jwt token',
      description: '',
      required: false,
    }),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Create a new event' }),
    ApiBody({
      type: CreateEventDto,
      description: 'Event data to create a new event',
    }),
    ApiBadRequestResponse({ description: 'Invalid input data' })
  );
};

export const updateEventSwagger = () => {
  return applyDecorators(
    ApiTags('events'),
    ApiHeader({
      name: 'jwt token',
      description: '',
      required: false,
    }),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Update an existing event' }),
    ApiBody({
      type: UpdateEventDto,
      description: 'Event data to update an existing event',
    }),
    ApiBadRequestResponse({ description: 'Invalid input data' })
  );
};

export const getEventByIdSwagger = () => {
  return applyDecorators(
    ApiTags('events'),
    ApiHeader({
      name: 'jwt token',
      description: '',
      required: false,
    }),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get event by ID' }),
    ApiParam({ name: 'id', required: false, description: 'ID of the event' }),
    ApiResponse({ status: 200, description: 'Event found successfully' }),
    ApiResponse({ status: 422, description: 'No data found' })
  );
};

export const deleteEventByIdSwagger = () => {
  return applyDecorators(
    ApiTags('events'),
    ApiHeader({
      name: 'jwt token',
      description: '',
      required: false,
    }),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Delete event by ID' }),
    ApiParam({
      name: 'id',
      required: true,
      description: 'ID of the event to be deleted',
    }),
    ApiResponse({ status: 200, description: 'Event deleted successfully' }),
    ApiResponse({ status: 404, description: 'Event not found' }),
    ApiResponse({ status: 500, description: 'Error deleting event' })
  );
};

export const getUserEventsSwagger = () => {
  return applyDecorators(
    ApiTags('events'),
    ApiHeader({
      name: 'authorization',
      description: '',
      required: false,
    }),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get events for a user by user ID' }),
    ApiParam({
      name: 'userId',
      required: true,
      description: 'ID of the user to fetch events for',
    }),
    ApiResponse({ status: 200, description: 'Events fetched successfully' }),
    ApiResponse({
      status: 400,
      description: 'Bad request: User ID is required',
    }),
    ApiResponse({ status: 500, description: 'Error fetching events' })
  );
};

export const searchEventsSwagger = () => {
  return applyDecorators(
    ApiTags('events'),
    ApiHeader({
      name: 'jwt token',
      description: '',
      required: false,
    }),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Search events' }),
    ApiQuery({
      name: 'location',
      required: false,
      description: 'Location of the event',
    }),
    ApiQuery({
      name: 'name',
      required: false,
      description: 'Name of the event',
    }),
    ApiQuery({
      name: 'startDate',
      required: false,
      description: 'Start date of the event',
    }),
    ApiQuery({
      name: 'endDate',
      required: false,
      description: 'End date of the event',
    }),
    ApiResponse({ status: 200, description: 'Events found successfully' }),
    ApiResponse({ status: 422, description: 'No data found' })
  );
};

export const getEventTypeSwagger = () => {
  return applyDecorators(
    ApiTags('events'),
    ApiHeader({
      name: 'authorization',
      description: '',
      required: false,
    }),
    ApiBearerAuth(),
    ApiOperation({ summary: 'Get events type list' }),
    ApiResponse({
      status: 200,
      description: 'Events type fetched successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad request: Somthing went wrong.',
    }),
    ApiResponse({ status: 500, description: 'Error fetching events type' })
  );
};

export const getEventsByStatusSwagger = () => {
  return applyDecorators(
    ApiTags('events'),
    ApiOperation({ summary: 'Get events by status' }),
    ApiBearerAuth(),
    ApiQuery({
      name: 'status',
      enum: ['past', 'current', 'trending', 'upcoming'],
      description: 'Type of events to fetch',
    }),
    ApiOkResponse({ description: 'Successfully fetched events' }),
    ApiBadRequestResponse({ description: 'Invalid input data' })
  );
};

export const findEventsSwagger = () => {
  return applyDecorators(
    ApiTags('events'),
    ApiOperation({
      summary: 'Find events by keyword (name, genre, location)',
    }),
    ApiBearerAuth(),
    ApiQuery({
      name: 'keyword',
      required: false,
      description: 'Keyword to fetch events',
    }),
    ApiQuery({
      name: 'type',
      required: false,
      description: 'Filter events by type (trending/upcoming)',
      enum: ['trending', 'upcoming'],
      example: 'trending',
    }),
    ApiOkResponse({ description: 'Successfully fetched events' }),
    ApiBadRequestResponse({ description: 'Invalid type of event.' }),
    ApiInternalServerErrorResponse({
      description: 'An error occurred while searching for events.',
    })
  );
};

export const getEventsByCreatorSwagger = () => {
  return ApiOperation({
    summary: 'Get events by creator',
    description: 'Retrieve all events created by a specific user',
  });
};
