import { applyDecorators } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader, ApiBody, ApiBadRequestResponse, ApiResponse } from '@nestjs/swagger';
import { SignupDto, LoginDto, UpdateUserDto, } from './user.dto';

export const createUserSwagger = () => {
  return applyDecorators(
    ApiTags('user'),
    ApiOperation({ summary: 'Create a new user' }),
    ApiBody({
      type: SignupDto,
      description: 'User data to create a new user',
    }),
    ApiBadRequestResponse({ description: 'Invalid input data' }),
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
    ApiBadRequestResponse({ description: 'Invalid input data' }),
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
    ApiBadRequestResponse({ description: 'Invalid input data' }),
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
    ApiResponse({ status: 500, description: 'Failed to fetch user' }),
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
    ApiResponse({ status: 200, description: 'User list retrieved successfully' }),
    ApiResponse({ status: 500, description: 'Failed to fetch users' }),
  );
};
