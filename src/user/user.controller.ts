import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  Patch,
  UseGuards,
  Delete,
  Put,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "./guards/auth.guard";
import { UserService } from "./user.service";
import {
  createUserSwagger,
  loginUserSwagger,
  updateUserSwagger,
  getUserByIdSwagger,
  getAllUsersSwagger,
  resetPasswordSwagger,
  forgetPasswordSwagger,
} from "./swagger.user";

@ApiTags("user")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("signup")
  @createUserSwagger()
  async signup(@Body() userData: any) {
    return this.userService.signup(userData);
  }

  @Post("login")
  @loginUserSwagger()
  async login(@Body() credentials: { email: string; password: string }) {
    return this.userService.login(credentials);
  }

  @Get(":id")
  @getUserByIdSwagger()
  @UseGuards(AuthGuard)
  async getUserById(@Param("id") id: number) {
    return this.userService.getUserById(id);
  }

  @Get()
  @getAllUsersSwagger()
  @UseGuards(AuthGuard)
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Patch(":id")
  @updateUserSwagger()
  @UseGuards(AuthGuard)
  async updateUserProfile(@Param("id") id: number, @Body() userData: any) {
    return this.userService.updateUserProfile(id, userData);
  }

  @Delete(":id")
  async deleteUser(@Param("id") id: number) {
    return this.userService.deleteUser(id);
  }

  @Post("forgot-password")
  @forgetPasswordSwagger()
  async forgotPassword(@Body("email") email: string) {
    return this.userService.forgotPassword(email);
  }

  @Post("reset-password")
  @resetPasswordSwagger()
  async resetPassword(
    @Body("token") token: string,
    @Body("newPassword") newPassword: string
  ) {
    return this.userService.resetPassword(token, newPassword);
  }
}
