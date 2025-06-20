import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetEventsByTypeDto {
  @ApiProperty()
  @IsString()
  readonly type: string;
}
