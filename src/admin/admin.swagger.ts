import { applyDecorators } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiBadRequestResponse,
  ApiHeader,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
  ApiParam,
} from "@nestjs/swagger";
import { Event } from "src/event/event.entity";
import { UpdateEventDto } from "src/event/events.dto";

export const getEventsByTypeSwagger = () => {
  return applyDecorators(
    ApiTags("admin"),
    ApiOperation({ summary: "Get events by type" }),
    ApiHeader({
      name: "token",
      description: "JWT token for authentication",
      required: false,
    }),
    ApiBearerAuth(),
    ApiQuery({
      name: "type",
      enum: ["past", "current", "trending", "upcoming"],
      description: "Type of events to fetch",
    }),
    ApiBadRequestResponse({ description: "Invalid input data" })
  );
};

export const updateStatusEventSwagger = () => {
  return applyDecorators(
    ApiTags("admin"),
    ApiOperation({
      summary: "Change the Active Status of the event (true/false)",
    }),
    ApiBearerAuth(),
    ApiBody({
      type: UpdateEventDto,
      description: "Updated Active Status",
    }),
    ApiResponse({ status: 200, description: "Event updated successfully" }),
    ApiResponse({ status: 404, description: "Event not found" }),
    ApiResponse({ status: 500, description: "Error updating event" })
  );
};

export const updateApprovalSwagger = () => {
  return applyDecorators(
    ApiTags("admin"),
    ApiOperation({
      summary: "Change the Approval status of the event",
    }),
    ApiBearerAuth(),
    ApiParam({
      name: "id",
      required: true,
      description: "Id of the event",
    }),
    ApiBody({
      schema: {
        type: "object",
        properties: {
          approval: {
            type: "string",
            enum: ["PENDING", "APPROVED", "REJECTED"],
            example: "APPROVED",
          },
        },
        required: ["approval"],
      },
    }),
    ApiResponse({
      status: 200,
      description: "Approval status updated successfully",
    }),
    ApiResponse({
      status: 403,
      description: "Forbidden. Only admin can access this.",
    }),
    ApiResponse({ status: 404, description: "Event not found" }),
    ApiResponse({ status: 422, description: "Invalid approval value" })
  );
};

export const getUserStatsSwagger = () => {
  return applyDecorators(
    ApiTags("admin"),
    ApiOperation({ summary: "Get user creation statistics for the last few months" }),
    ApiBearerAuth(),
    ApiQuery({
      name: "months",
      required: false,
      type: Number,
      description: "Number of months to fetch data for (default: 6)",
      example: 6
    }),
    ApiResponse({
      status: 200,
      description: "User creation statistics retrieved successfully",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: 200 },
          message: { type: "string", example: "User creation statistics retrieved successfully" },
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                month: { type: "string", example: "Jan 2024" },
                count: { type: "number", example: 5 }
              }
            }
          }
        }
      }
    }),
    ApiResponse({ status: 401, description: "Unauthorized" }),
    ApiResponse({ status: 403, description: "Forbidden. Only admin can access this." }),
    ApiResponse({ status: 500, description: "Error fetching user creation statistics" })
  );
};
