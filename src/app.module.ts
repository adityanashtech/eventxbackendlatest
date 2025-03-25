import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { EventController } from "./event/event.controller";
import { Event } from "./event/event.entity";
import { UserController } from "./user/user.controller";
import { User } from "./user/user.entity";
import { AdminModule } from "./admin/admin.module";
import { UserEventModule } from "./user-event/user-event.module";
import { UserEvent } from "./user-event/user-event.entity";
import { JwtModule } from "@nestjs/jwt";
import { MailSender } from "./mailSender";
import { ConfigModule } from "@nestjs/config";
import { EventModule } from "./event/event.module";

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: ".dev.env", isGlobal: true }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "eventx.cj6coymwuw89.eu-north-1.rds.amazonaws.com",
      port: 5432,
      username: "postgres",
      password: "india0192",
      database: "eventx",
      entities: [Event, User, UserEvent],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false, // Required for connecting to Render PostgreSQL
      }, // Automatic schema synchronization (not recommended in production)
    }),
    TypeOrmModule.forFeature([Event, User, UserEvent]),
    AdminModule,
    EventModule,
    UserEventModule,
    JwtModule.register({
      global: true,
      secret: "qwertyuiopasdfghjklzxcvbnm123456",
      signOptions: { expiresIn: "600s" },
    }),
  ],
  controllers: [AppController, EventController, UserController],
  providers: [AppService, MailSender],
})
export class AppModule {}
