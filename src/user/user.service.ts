import {
  Injectable,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { User } from "./user.entity";
import { Event } from "../event/event.entity";
import { MailSender } from "../mailSender";
import * as Joi from "joi";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private jwtService: JwtService,
    private mailSender: MailSender
  ) {}

  async signup(
    userData: any
  ): Promise<{ message: string; data?: User; statusCode: number }> {
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
      return { statusCode: 400, message: error.details[0].message };
    }

    const { name, email, phone, password, role, age } = value;
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      return {
        statusCode: 400,
        message: "User with this email already exists",
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.userRepository.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role.toLowerCase(),
      age,
    });
    const savedUser = await this.userRepository.save(newUser);

    await this.mailSender.sendMail(
      email,
      "Welcome to NashTech!",
      `Hi ${name},\n\nWelcome to NashTech! Your signup was successful.\n\nBest regards,\nThe NashTech Team`
    );

    return {
      statusCode: 200,
      message: "User signup successful",
      data: savedUser,
    };
  }

  async login(credentials: { email: string; password: string }): Promise<{
    message: string;
    access_token?: string;
    data?: any;
    statuscode: number;
  }> {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const { error, value } = schema.validate(credentials);
    if (error) {
      return { statuscode: 400, message: error.details[0].message };
    }

    const { email, password } = value;
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return {
        statuscode: 422,
        message: "User with this email does not exist.",
      };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { statuscode: 401, message: "Invalid Password." };
    }

    delete user.password;
    const payload = { sub: user.id, username: user.email };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      statuscode: 200,
      message: "Login successful",
      access_token,
      data: user,
    };
  }

  async getUserById(
    id: number
  ): Promise<{ message: string; data?: User; statusCode: number }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }
    delete user.password;
    return {
      statusCode: HttpStatus.OK,
      message: "User found successfully.",
      data: user,
    };
  }

  async getAllUsers(): Promise<{
    message: string;
    data?: User[];
    statusCode: number;
  }> {
    const users = await this.userRepository.find();
    return {
      statusCode: HttpStatus.OK,
      message: "User list retrieved successfully.",
      data: users,
    };
  }

  async updateUserProfile(
    id: number,
    userData: any
  ): Promise<{ message: string; data?: User; statusCode: number }> {
    const schema = Joi.object({
      name: Joi.string().optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional(),
      age: Joi.number().integer().min(0).max(150).optional(),
      image: Joi.string().optional(),
    });

    const { error } = schema.validate(userData);
    if (error) {
      return { statusCode: 400, message: error.details[0].message };
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    Object.assign(user, userData);
    const updatedUser = await this.userRepository.save(user);
    delete updatedUser.password;

    if (userData.email || userData.phone) {
      const eventsToUpdate = await this.eventRepository.find({
        where: { user_id: id },
      });
      for (const event of eventsToUpdate) {
        if (userData.email) event.email = userData.email;
        if (userData.phone) event.phone = userData.phone;
        await this.eventRepository.save(event);
      }
    }

    return {
      statusCode: HttpStatus.OK,
      message: "User profile updated successfully",
      data: updatedUser,
    };
  }

  async deleteUser(
    id: number
  ): Promise<{ message: string; statusCode: number }> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    await this.userRepository.delete(id);
    return { statusCode: HttpStatus.OK, message: "User deleted successfully" };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Generate reset token (valid for 1 hour)
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Send reset password email
    await this.mailSender.sendResetPasswordEmail(email, token);
    return { message: "Reset password email sent" };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      const user = await this.userRepository.findOne({
        where: { id: decoded.sub },
      });

      if (!user) {
        throw new NotFoundException("Invalid token or user not found");
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;

      // Save updated user
      await this.userRepository.save(user);
      return { message: "Password reset successful" };
    } catch (error) {
      throw new BadRequestException("Invalid or expired token");
    }
  }
}
