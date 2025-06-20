import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventController } from './event/event.controller';
import { Event } from './event/event.entity';
import { UserController } from './user/user.controller';
import { User } from './user/user.entity';
import { AdminModule } from './admin/admin.module';
import { UserEventModule } from './user-event/user-event.module';
import { UserEvent } from './user-event/user-event.entity';
import { JwtModule } from '@nestjs/jwt';
import { MailSender } from './mailSender';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './event/event.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Event, User, UserEvent],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false, // Required for connecting to Render PostgreSQL
      }, // Automatic schema synchronization (not recommended in production)
    }),
    TypeOrmModule.forFeature([Event, User, UserEvent]),
    AdminModule,
    UserModule,
    EventModule,
    UserEventModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN },
    }),
  ],
  controllers: [AppController, EventController, UserController],
  providers: [AppService, MailSender],
})
export class AppModule {}
