import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { User } from '../user/user.entity';
import { HttpStatus, HttpException } from '@nestjs/common';

describe('EventController', () => {
  let controller: EventController;
  let eventRepository: Repository<Event>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        {
          provide: getRepositoryToken(Event),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    controller = module.get<EventController>(EventController);
    eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create an event', async () => {
      // Mock user repository behavior
      const mockUser = new User();
      mockUser.id = 1;
      mockUser.email = 'test@example.com';
      mockUser.phone = '1234567890';
      mockUser.role = 'admin';
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);

      // Mock event data
      const eventData = {
        user_id: 1,
        event_name: 'Test Event',
        location: 'Test Location',
        event_start_date: new Date().toISOString(),
        event_end_date: new Date(
          new Date().getTime() + 3600 * 1000
        ).toISOString(),
        description: 'Test Description',
        registration_fee: 10,
        trending: true,
        event_type: 'Test Type',
      };
      const mockEvent = new Event();
      mockEvent.user_id = eventData.user_id;
      mockEvent.event_name = eventData.event_name;
      mockEvent.location = eventData.location;
      mockEvent.event_start_date = new Date(eventData.event_start_date);
      mockEvent.event_end_date = new Date(eventData.event_end_date);
      mockEvent.description = eventData.description;
      mockEvent.registration_fee = eventData.registration_fee;
      mockEvent.trending = eventData.trending;
      mockEvent.event_type = eventData.event_type;
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(eventRepository, 'save').mockResolvedValue(mockEvent);

      const result = await controller.createEvent(eventData);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Event saved successfully');
      expect(result.event).toBeDefined();
      expect(result.event.user_id).toBe(1);
      expect(result.event.event_name).toBe('Test Event');
    });

    it('should return error when user does not exist', async () => {
      const eventData = {
        user_id: 999,
        event_name: 'Test Event',
        location: 'Test Location',
        event_start_date: new Date().toISOString(),
        event_end_date: new Date(
          new Date().getTime() + 3600 * 1000
        ).toISOString(),
        description: 'Test Description',
        registration_fee: 10,
        trending: true,
        event_type: 'Test Type',
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      try {
        await controller.createEvent(eventData);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('User does not exist with this id.');
        expect(error.getStatus()).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      }
    });
  });

  describe('getEventById', () => {
    it('should return an event by ID', async () => {
      const eventId = 1;
      const mockEvent = new Event();
      mockEvent.id = eventId;
      mockEvent.event_name = 'Test Event';
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent);

      const result = await controller.getEventById(eventId);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Event found successfully');
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe(eventId);
      expect(result.data[0].event_name).toBe('Test Event');
    });

    it('should return error when event is not found by ID', async () => {
      const eventId = 999;
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      const result = await controller.getEventById(eventId);

      expect(result.statusCode).toBe(422);
      expect(result.message).toBe('No data found');
    });
  });

  describe('deleteEventById', () => {
    it('should delete an event by ID', async () => {
      const eventId = 1;
      const mockEvent = new Event();
      mockEvent.id = eventId;
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent);
      jest.spyOn(eventRepository, 'remove').mockResolvedValueOnce(undefined);

      const result = await controller.deleteEventById(eventId);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Event deleted successfully');
    });

    it('should return error when event to delete is not found by ID', async () => {
      const eventId = 999;
      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      try {
        await controller.deleteEventById(eventId);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Event not found');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('updateEventById', () => {
    it('should update an event by ID', async () => {
      const eventId = 1;
      const updateData = {
        event_name: 'Updated Event Name',
        location: 'Updated Location',
      };

      const mockEvent = new Event();
      mockEvent.id = eventId;
      mockEvent.event_name = 'Original Event Name';
      mockEvent.location = 'Original Location';

      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(mockEvent);
      jest.spyOn(eventRepository, 'save').mockImplementation((event) => {
        const updatedEvent = { ...mockEvent, ...event };
        return Promise.resolve(updatedEvent as Event);
      });

      const result = await controller.updateEventById(eventId, updateData);

      expect(result.statusCode).toBe(200);
      expect(result.message).toBe('Event updated successfully');
      expect(result.event).toBeDefined();
      expect(result.event.event_name).toBe('Updated Event Name');
      expect(result.event.location).toBe('Updated Location');
    });

    it('should return error when event to update is not found by ID', async () => {
      const eventId = 999;
      const updateData = {
        event_name: 'Updated Event Name',
        location: 'Updated Location',
      };

      jest.spyOn(eventRepository, 'findOne').mockResolvedValue(null);

      try {
        await controller.updateEventById(eventId, updateData);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Event not found');
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
