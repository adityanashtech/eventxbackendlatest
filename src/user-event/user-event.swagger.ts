import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiBadRequestResponse, ApiResponse, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
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
    ApiBody({ type: RegisterUserEventDto, description: 'Data to register a user to an event' }),
    ApiBadRequestResponse({ description: 'Invalid input data' }),
    ApiResponse({ status: 422, description: 'User or Event not found' }),
    ApiResponse({ status: 200, description: 'User registered to event successfully' }),
  );
};

export const getUserEventsSwagger = () => {
  return applyDecorators(
    ApiHeader({
        name: 'jwt token',
        description: '',
        required: false,
    }),
    ApiBearerAuth(),
    ApiTags('user-event'),
    ApiOperation({ summary: 'Get events for a user' }),
    ApiResponse({ status: 200, description: 'Events retrieved successfully' }),
    ApiResponse({ status: 422, description: 'No events found for user' }),
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
    ApiResponse({ status: 422, description: 'No users found for event' }),
  );
};
