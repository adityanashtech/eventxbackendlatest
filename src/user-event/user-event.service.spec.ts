import { Test, TestingModule } from '@nestjs/testing';
import { UserEventService } from './user-event.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEvent } from './user-event.entity';
import { User } from '../user/user.entity';
import { Event } from '../event/event.entity';
import { Repository } from 'typeorm';

describe('UserEventService', () => {
  let service: UserEventService;
  let mockUserEventRepository: jest.Mocked<Partial<Repository<UserEvent>>>;
  let mockUserRepository: jest.Mocked<Partial<Repository<User>>>;
  let mockEventRepository: jest.Mocked<Partial<Repository<Event>>>;

  beforeEach(async () => {
    mockUserEventRepository = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockEventRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserEventService,
        {
          provide: getRepositoryToken(UserEvent),
          useValue: mockUserEventRepository,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Event), useValue: mockEventRepository },
      ],
    }).compile();

    service = module.get<UserEventService>(UserEventService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUserToEvent', () => {
    it('should register user to event successfully', async () => {
      mockUserRepository.findOne.mockResolvedValue({ id: 1 } as User);
      mockEventRepository.findOne.mockResolvedValue({ id: 1 } as Event);
      mockUserEventRepository.findOne.mockResolvedValue(null);
      const mockUserEvent = {
        id: 1,
        user: { id: 1 } as User,
        event: { id: 1 } as Event,
      };
      mockUserEventRepository.create.mockReturnValue(
        mockUserEvent as UserEvent
      );
      mockUserEventRepository.save.mockResolvedValue(
        mockUserEvent as UserEvent
      );

      const result = await service.registerUserToEvent(1, 1);

      expect(mockUserRepository.findOne).toBeCalledWith({ where: { id: 1 } });
      expect(mockEventRepository.findOne).toBeCalledWith({ where: { id: 1 } });
      expect(mockUserEventRepository.findOne).toBeCalledWith({
        where: { user: { id: 1 }, event: { id: 1 } },
      });
      expect(mockUserEventRepository.create).toBeCalledWith({
        user: { id: 1 },
        event: { id: 1 },
      });
      expect(mockUserEventRepository.save).toBeCalledWith(
        mockUserEvent as UserEvent
      );
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('User registered to event successfully');
      expect(result.data).toEqual(mockUserEvent);
    });
  });

  describe('getUserEvents', () => {
    it('should retrieve events for existing user', async () => {
      const mockUserEvents: UserEvent[] = [
        {
          id: 1,
          user: { id: 1 } as User,
          event: {
            id: 1,
            user_id: 1,
            event_name: 'Test Eventsssssss',
            email: 'test@yopmail.com',
            phone: '8080808081',
            location: 'Gurugram',
            trending: true,
            registration_fee: 500,
            event_start_date: new Date('2024-07-27T00:00:00.000Z'),
            event_end_date: new Date('2024-07-29T00:00:00.000Z'),
            description: 'This is a test event',
            user_type: 'user',
            status: 'active',
            event_type: 'music',
            image: 'image',
            created_at: new Date('2024-07-01T11:41:32.995Z'),
            updated_at: new Date('2024-07-01T11:41:32.995Z'),
            userEvents: [],
          },
          registered_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockUserRepository.findOne.mockResolvedValue({ id: 1 } as User);

      mockUserEventRepository.findAndCount.mockResolvedValue([
        mockUserEvents,
        mockUserEvents.length,
      ]);

      const result = await service.getUserEvents(1);

      expect(mockUserRepository.findOne).toBeCalledWith({ where: { id: 1 } });
      expect(mockUserEventRepository.findAndCount).toBeCalledWith({
        where: { user: { id: 1 } },
        relations: ['event'],
      });
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Events retrieved successfully');

      expect(result.data).toBeDefined();

      expect(result.data.event).toBeDefined();
      expect(result.data.event).toEqual(mockUserEvents.map((ev) => ev.event));

      expect(result.data.totalUserCount).toBe(1);
    });
  });

  describe('getEventUsers', () => {
    it('should retrieve users for existing event', async () => {
      const mockUserEvents: UserEvent[] = [
        {
          id: 1,
          user: {
            id: 1,
            name: 'Test',
            email: 'test@yopmail.com',
            phone: '8080808081',
            role: 'user',
            age: null,
            image: null,
            created_at: new Date('2024-07-01T11:34:04.139Z'),
            updated_at: new Date('2024-07-01T11:34:04.139Z'),
          } as User,
          event: { id: 1 } as Event,
          registered_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          user: {
            id: 2,
            name: 'Test2',
            email: 'test2@yopmail.com',
            phone: '8080808082',
            role: 'user',
            age: null,
            image: null,
            created_at: new Date('2024-07-01T11:34:04.139Z'),
            updated_at: new Date('2024-07-01T11:34:04.139Z'),
          } as User,
          event: { id: 1 } as Event,
          registered_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockEventRepository.findOne.mockResolvedValue({ id: 1 } as Event);
      mockUserEventRepository.findAndCount.mockResolvedValue([
        mockUserEvents,
        mockUserEvents.length,
      ]);

      const result = await service.getEventUsers(1);

      expect(mockEventRepository.findOne).toBeCalledWith({ where: { id: 1 } });
      expect(mockUserEventRepository.findAndCount).toBeCalledWith({
        where: { event: { id: 1 } },
        relations: ['user'],
      });
      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Users retrieved successfully');
      expect(result.data.users).toEqual(mockUserEvents.map((ue) => ue.user));
      expect(result.data.totalUserCount).toBe(2);
    });
  });
});
