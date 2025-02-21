import { Controller, Post, Body, HttpStatus, HttpException, Param, Get, Patch, UseGuards, Delete, Put } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Joi from 'joi';
import { Event } from '../event/event.entity';
import * as bcrypt from 'bcryptjs';
import { SignupDto, LoginDto } from './user.dto';
import { createUserSwagger, loginUserSwagger, updateUserSwagger, getUserByIdSwagger, getAllUsersSwagger } from './swagger.user';
import { plainToClass } from 'class-transformer';
import { ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard'
import { MailSender } from '../mailSender'


@Controller('user')
@ApiTags('user')
export class UserController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private jwtService: JwtService,
    private mailSender: MailSender
  ) { }

  @Post('signup')
  @createUserSwagger()
  async signup(@Body() userData: any): Promise<{ message: string, data?: User, statusCode: number }> {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      password: Joi.string().required(),
      role: Joi.string().required(),
      age: Joi.string().required(),
    });

    const { error, value } = schema.validate(userData);
    if (error) {
      return {
        statusCode: 400,
        message: error.details[0].message,
      };
    }

    const { name, email, phone, password, role, age } = value;
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      return {
        statusCode: 400,
        message: 'User with this email already exists',
      };
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role.toLowerCase(),
      age: age
    });
    const savedUser = await this.userRepository.save(newUser);
    let sendMail = await this.mailSender.sendMail(
      email,
      'Welcome to NashTech!',
      `Hi ${name},\n\nWelcome to NashTech! Your signup was successful.\n\nBest regards,\nThe NashTech Team`
    );
    console.log(sendMail,'sendMail')
    return {
      statusCode: 200,
      message: 'User signup successful',
      data: savedUser,
    };
  }

  @Post('login')
  @loginUserSwagger()
  async login(@Body() credentials: { email: string, password: string }): Promise<{ message: string,access_token?: string, data?: any, statuscode: number }> {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const { error, value } = schema.validate(credentials);
    if (error) {
      return {
        statuscode: 400,
        message: error.details[0].message,
      };
    }

    const { email, password } = value;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return {
        statuscode: 422,
        message: 'User with this email does not exist.',
      };
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return {
        statuscode: 401,
        message: 'Invalid Password.',
      };
    }
    delete user.password;

    const payload = { sub: user.id, username: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      statuscode: 200,
      message: 'Login successful',
      access_token: access_token,
      data: user,
    };
  }

  @Get(':id')
  @getUserByIdSwagger()
  @UseGuards(AuthGuard)
  async getUserById(@Param('id') id: number): Promise<{ message: string; data?: User; statusCode: number }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      delete user.password;
      return {
        statusCode: HttpStatus.OK,
        message: 'User found successfully.',
        data: user,
      };
    } catch (error) {
      throw new HttpException('Failed to fetch user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @getAllUsersSwagger()
  @UseGuards(AuthGuard)
  async getAllUsers(): Promise<{ message: string; data?: User[]; statusCode: number }> {
    try {
      const users = await this.userRepository.find();

      return {
        statusCode: HttpStatus.OK,
        message: 'User list retrieved successfully.',
        data: users,
      };
    } catch (error) {
      throw new HttpException('Failed to fetch users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  @Patch(':id')
  @updateUserSwagger()
  @UseGuards(AuthGuard)
  async updateUserProfile(@Param('id') id: number, @Body() userData: any): Promise<{ message: string; data?: User; statusCode: number }> {
    try {
      const schema = Joi.object({
        name: Joi.string().optional(),
        email: Joi.string().email().optional(),
        phone: Joi.string().optional(),
        age: Joi.number().integer().min(0).max(150).optional(),
        image: Joi.string().optional(),
      });

      const { error } = schema.validate(userData);
      if (error) {
        return {
          statusCode: 400,
          message: error.details[0].message,
        };
      }
      const user = await this.userRepository.findOne({ where: { id: id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      Object.assign(user, userData);
      const updatedUser = await this.userRepository.save(user);
      delete updatedUser.password;
      if (userData.email || userData.phone) {
        const eventsToUpdate = await this.eventRepository.find({ where: { user_id: id } });
        for (const event of eventsToUpdate) {
          if (userData.email) {
            event.email = userData.email;
          }
          if (userData.phone) {
            event.phone = userData.phone;
          }
          await this.eventRepository.save(event);
        }
      }

      return {
        statusCode: HttpStatus.OK,
        message: 'User profile updated successfully',
        data: updatedUser,
      };
    } catch (error) {
      throw new HttpException('Failed to update user profile', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<{ message: string; statusCode: number }> {
    try {
      const user = await this.userRepository.findOne({ where: { id: id } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      
      await this.userRepository.delete(id);

      return {
        statusCode: HttpStatus.OK,
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }  
  @Put('reset-password')
  async updateUserPassword(@Body() eventData) {

    try {
      const user = await this.userRepository.findOne({ where: { email: eventData.email } });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(eventData.password, 10);

      const event = await this.userRepository.update(user.id,{ "password": hashedPassword,updated_at: new Date() });
      let updatedUser: User = await this.userRepository.findOne({
        where: 
          { id:eventData.userId }
      });
      
      return { statusCode: 200, message: 'Password reset successfully', user: updatedUser };
    } catch (error) {
      throw new HttpException('Error resetting password', HttpStatus.INTERNAL_SERVER_ERROR);
    }  
  }
}
