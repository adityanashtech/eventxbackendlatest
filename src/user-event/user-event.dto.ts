import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class RegisterUserEventDto {
  @ApiProperty({ description: 'ID of the user' })
  @IsInt()
  @IsNotEmpty()
  readonly user_id: number;

  @ApiProperty({ description: 'ID of the event' })
  @IsInt()
  @IsNotEmpty()
  readonly event_id: number;
}
