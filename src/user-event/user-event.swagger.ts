import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBadRequestResponse,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RegisterUserEventDto } from './user-event.dto';

export const registerUserToEventSwagger = () => {
  return applyDecorators(
    ApiHeader({
      name: 'jwt token',
      description: '',
      required: false,
    }),
    ApiBearerAuth(),
    ApiTags('user-event'),
    ApiOperation({ summary: 'Register a user to an event' }),
    ApiBody({
      type: RegisterUserEventDto,
      description: 'Data to register a user to an event',
    }),
    ApiBadRequestResponse({ description: 'Invalid input data' }),
    ApiResponse({ status: 422, description: 'User or Event not found' }),
    ApiResponse({
      status: 200,
      description: 'User registered to event successfully',
    })
  );
};

export const getUserEventsSwagger = () => {
  return applyDecorators(
    ApiTags('user-event'),
    ApiBearerAuth(),
    // ApiHeader({
    //   name: 'jwt token',
    //   description: 'JWT token for authentication',
    //   required: false,
    // }),
    ApiOperation({ summary: 'Get events for a user by status' }),
    ApiParam({
      name: 'user_id',
      required: true,
      description: 'ID of the user',
      type: Number,
    }),
    ApiQuery({
      name: 'status',
      required: false,
      description:
        "Filter events by status: 'ongoing', 'past', 'upcoming', or 'all' (default is 'all')",
      enum: ['ongoing', 'past', 'upcoming', 'all'],
      example: 'ongoing',
    }),
    ApiResponse({ status: 200, description: 'Events retrieved successfully' }),
    ApiResponse({ status: 400, description: 'Validation error' }),
    ApiResponse({
      status: 404,
      description: 'User not found or no events available',
    }),
    ApiResponse({ status: 500, description: 'Internal server error' })
  );
};

export const getEventUsersSwagger = () => {
  return applyDecorators(
    ApiHeader({
      name: 'jwt token',
      description: '',
      required: false,
    }),
    ApiBearerAuth(),
    ApiTags('user-event'),
    ApiOperation({ summary: 'Get users for an event' }),
    ApiResponse({ status: 200, description: 'Users retrieved successfully' }),
    ApiResponse({ status: 422, description: 'No users found for event' })
  );
};
