import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBadRequestResponse, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';

export const getEventsByTypeSwagger = () => {
  return applyDecorators(
    ApiTags('admin'),
    ApiOperation({ summary: 'Get events by type' }),
    ApiHeader({
        name: 'token',
        description: 'JWT token for authentication',
        required: false,
    }),
    ApiBearerAuth(),
    ApiQuery({ name: 'type', enum: ['past', 'current', 'trending', 'upcoming'], description: 'Type of events to fetch' }),
    ApiBadRequestResponse({ description: 'Invalid input data' }),
  );
};
