import { applyDecorators } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiHeader,
  ApiBody,
  ApiBadRequestResponse,
  ApiResponse,
} from '@nestjs/swagger';
import { SignupDto, LoginDto, UpdateUserDto } from './user.dto';

export const createUserSwagger = () => {
  return applyDecorators(
    ApiTags('user'),
    ApiOperation({ summary: 'Create a new user' }),
    ApiBody({
      type: SignupDto,
      description: 'User data to create a new user',
    }),
    ApiBadRequestResponse({ description: 'Invalid input data' })
  );
};

export const loginUserSwagger = () => {
  return applyDecorators(
    ApiTags('user'),
    ApiOperation({ summary: 'User login' }),
    ApiBody({
      type: LoginDto,
      description: 'User credentials for login',
    }),
    ApiBadRequestResponse({ description: 'Invalid input data' })
  );
};

export const updateUserSwagger = () => {
  return applyDecorators(
    ApiTags('user'),
    ApiOperation({ summary: 'Update user information' }),
    ApiBearerAuth(),
    ApiHeader({
      name: 'jwt token',
      description: '',
      required: false,
    }),
    ApiBody({
      type: UpdateUserDto,
      description: 'User data to update',
    }),
    ApiBadRequestResponse({ description: 'Invalid input data' })
  );
};

export const getUserByIdSwagger = () => {
  return applyDecorators(
    ApiTags('user'),
    ApiOperation({ summary: 'Get user by ID' }),
    ApiHeader({
      name: 'jwt token',
      description: '',
      required: false,
    }),
    ApiBearerAuth(),
    ApiResponse({ status: 200, description: 'User found successfully' }),
    ApiResponse({ status: 404, description: 'User not found' }),
    ApiResponse({ status: 500, description: 'Failed to fetch user' })
  );
};

export const getAllUsersSwagger = () => {
  return applyDecorators(
    ApiTags('user'),
    ApiOperation({ summary: 'Get all users' }),
    ApiHeader({
      name: 'jwt token',
      description: '',
      required: false,
    }),
    ApiBearerAuth(),
    ApiResponse({
      status: 200,
      description: 'User list retrieved successfully',
    }),
    ApiResponse({ status: 500, description: 'Failed to fetch users' })
  );
};

export const forgetPasswordSwagger = () => {
  return applyDecorators(
    ApiTags('user'),
    ApiOperation({
      summary: 'Forget password sends email with a code to reset password',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            description: 'Registered email ID',
            example: 'user@example.com',
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Email sent successfully.' }),
    ApiResponse({
      status: 500,
      description: 'Failed to send the email, please recheck the email ID.',
    })
  );
};

export const resetPasswordSwagger = () => {
  return applyDecorators(
    ApiTags('user'),
    ApiOperation({ summary: 'Reset password using the token sent via email' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            description: 'Reset token received via email',
            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          newPassword: {
            type: 'string',
            description: 'New password for the user',
            example: 'NewSecurePassword123!',
          },
        },
      },
    }),
    ApiResponse({ status: 200, description: 'Password reset successful.' }),
    ApiResponse({ status: 400, description: 'Invalid or expired token.' }),
    ApiResponse({
      status: 500,
      description: 'Failed to reset password, please try again later.',
    })
  );
};
