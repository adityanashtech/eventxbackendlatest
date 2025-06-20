import { Test, TestingModule } from '@nestjs/testing';
import { UserEventController } from './user-event.controller';
import { UserEventService } from './user-event.service';
import { AuthGuard } from '../user/guards/auth.guard';

describe('UserEventController', () => {
  let controller: UserEventController;
  let service: UserEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserEventController],
      providers: [
        {
          provide: UserEventService,
          useValue: {
            registerUserToEvent: jest.fn(),
            getUserEvents: jest.fn(),
            getEventUsers: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserEventController>(UserEventController);
    service = module.get<UserEventService>(UserEventService);
  });

  it('should register user to event successfully', async () => {
    const mockResponse = {
      statusCode: 200,
      message: 'User registered to event successfully',
      data: {
        id: 12,
        user: {
          id: 1,
          name: 'test4',
          email: 'test4@yopmail.com',
          phone: '8080808085',
          password:
            '$2a$10$BGYhLyto2l7B05L0YuYBbeq24WDnEFSoPfmm4e3NvJjNxFDEJwQu6',
          role: 'user',
          age: null,
          image: null,
          created_at: new Date('2024-07-01T11:35:18.417Z'),
          updated_at: new Date('2024-07-01T11:35:18.417Z'),
          userEvents: [],
        },
        event: {
          id: 1,
          user_id: 2,
          event_name: 'Test Eventsssssss',
          email: 'test1@yopmail.com',
          phone: '8080808082',
          location: 'Gurugram',
          trending: true,
          registration_fee: 500,
          event_start_date: new Date('2024-07-27T00:00:00.000Z'),
          event_end_date: new Date('2024-07-29T00:00:00.000Z'),
          description: 'This is a test event',
          user_type: 'user',
          status: 'active',
          event_type: 'music',
          image: 'base64',
          created_at: new Date('2024-07-02T16:17:06.009Z'),
          updated_at: new Date('2024-07-02T16:17:06.009Z'),
          userEvents: [],
        },
        registered_at: new Date('2024-07-08T07:55:39.754Z'),
        created_at: new Date('2024-07-02T16:17:06.009Z'),
        updated_at: new Date('2024-07-02T16:17:06.009Z'),
      },
    };

    jest.spyOn(service, 'registerUserToEvent').mockResolvedValue(mockResponse);

    const result = await controller.registerUserToEvent({
      user_id: 1,
      event_id: 1,
    });

    expect(result).toEqual(mockResponse);
  });

  it('should get user events successfully', async () => {
    const mockResponse = {
      statusCode: 200,
      message: 'Events retrieved successfully',
      data: {
        users: {
          id: 1,
          name: 'Test',
          email: 'test@yopmail.com',
          phone: '8080808081',
          role: 'user',
          age: null,
          image: null,
          created_at: '2024-07-01T11:34:04.139Z',
          updated_at: '2024-07-01T11:34:04.139Z',
        },
        event: [
          {
            id: 4,
            user_id: 4,
            event_name: 'Test Eventsssssss',
            email: 'testuser@yopmail.com',
            phone: '1234567890',
            location: 'Gurugram',
            trending: true,
            registration_fee: 500,
            event_start_date: '2024-07-27T00:00:00.000Z',
            event_end_date: '2024-07-29T00:00:00.000Z',
            description: 'This is a test event',
            user_type: 'user',
            status: 'active',
            event_type: 'music',
            image: 'image',
            created_at: '2024-07-01T11:41:32.995Z',
            updated_at: '2024-07-01T11:41:32.995Z',
          },
          {
            id: 4,
            user_id: 4,
            event_name: 'Test Eventsssssss',
            email: 'testuser@yopmail.com',
            phone: '1234567890',
            location: 'Gurugram',
            trending: true,
            registration_fee: 500,
            event_start_date: '2024-07-27T00:00:00.000Z',
            event_end_date: '2024-07-29T00:00:00.000Z',
            description: 'This is a test event',
            user_type: 'user',
            status: 'active',
            event_type: 'music',
            image: 'image',
            created_at: '2024-07-01T11:41:32.995Z',
            updated_at: '2024-07-01T11:41:32.995Z',
          },
          {
            id: 5,
            user_id: 2,
            event_name: 'Test Eventsssssss',
            email: 'test1@yopmail.com',
            phone: '8080808082',
            location: 'Gurugram',
            trending: true,
            registration_fee: 500,
            event_start_date: '2024-07-27T00:00:00.000Z',
            event_end_date: '2024-07-29T00:00:00.000Z',
            description: 'This is a test event',
            user_type: 'user',
            status: 'active',
            event_type: 'music',
            image: 'image',
            created_at: '2024-07-02T16:17:06.009Z',
            updated_at: '2024-07-02T16:17:06.009Z',
          },
          {
            id: 6,
            user_id: 2,
            event_name: 'Event Name',
            email: 'test1@yopmail.com',
            phone: '8080808082',
            location: 'Gurugram',
            trending: true,
            registration_fee: 100,
            event_start_date: '2024-07-02T00:00:00.000Z',
            event_end_date: '2024-07-03T00:00:00.000Z',
            description: 'Event Description1',
            user_type: 'user',
            status: 'actice',
            event_type: 'coding',
            image: 'image',
            created_at: '2024-07-02T16:28:20.899Z',
            updated_at: '2024-07-02T16:28:20.899Z',
          },
        ],
        totalUserCount: 4,
      },
    };

    jest.spyOn(service, 'getUserEvents').mockResolvedValue(mockResponse);

    const result = await controller.getUserEvents('1');

    expect(result).toEqual(mockResponse);
  });

  it('should get event users successfully', async () => {
    const mockResponse = {
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: {
        users: {
          id: 1,
          name: 'Test',
          email: 'test@yopmail.com',
          phone: '8080808081',
          role: 'user',
          age: null,
          image: null,
          created_at: '2024-07-01T11:34:04.139Z',
          updated_at: '2024-07-01T11:34:04.139Z',
        },
        event: [
          {
            id: 1,
            user_id: 1,
            event_name: 'Event Name',
            email: 'test1@yopmail.com',
            phone: '8080808082',
            location: 'Gurugram',
            trending: true,
            registration_fee: 100,
            event_start_date: '2024-07-02T00:00:00.000Z',
            event_end_date: '2024-07-03T00:00:00.000Z',
            description: 'Event Description1',
            user_type: 'user',
            status: 'actice',
            event_type: 'coding',
            image: 'image',
            created_at: '2024-07-02T16:28:20.899Z',
            updated_at: '2024-07-02T16:28:20.899Z',
          },
          {
            id: 4,
            user_id: 4,
            event_name: 'Test Eventsssssss',
            email: 'testuser@yopmail.com',
            phone: '1234567890',
            location: 'Gurugram',
            trending: true,
            registration_fee: 500,
            event_start_date: '2024-07-27T00:00:00.000Z',
            event_end_date: '2024-07-29T00:00:00.000Z',
            description: 'This is a test event',
            user_type: 'user',
            status: 'active',
            event_type: 'music',
            image: 'image',
            created_at: '2024-07-01T11:41:32.995Z',
            updated_at: '2024-07-01T11:41:32.995Z',
          },
        ],
        totalEventUserCount: 2,
      },
    };

    jest.spyOn(service, 'getEventUsers').mockResolvedValue(mockResponse);

    const result = await controller.getEventUsers('1');

    expect(result).toEqual(mockResponse);
  });
});
