import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  // let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    // userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should throw error for invalid signup data', async () => {
      const userData = {
        // invalid data missing required fields
      };

      await expect(userController.signup(userData)).rejects.toThrowError(
        new HttpException('Invalid data', HttpStatus.BAD_REQUEST)
      );
    });

    // Add more test cases for valid and invalid scenarios in signup
  });

  describe('login', () => {
    it('should throw error for invalid email', async () => {
      const credentials = {
        email: 'invalid@example.com', // non-existing email
        password: 'password',
      };

      await expect(userController.login(credentials)).rejects.toThrowError(
        new HttpException('Invalid email', HttpStatus.UNAUTHORIZED)
      );
    });

    // Add more test cases for valid and invalid scenarios in login
  });
});
