import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDate,
  IsBoolean,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApprovalStatus } from './event.entity';

export class CreateEventDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly user_id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly event_name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly location: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  readonly event_start_date: Date;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  readonly event_end_date: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly event_type: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  readonly image?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly registration_fee: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  readonly trending: boolean;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  readonly status?: boolean;

  @ApiProperty({ required: false })
  @IsEnum(ApprovalStatus)
  @IsOptional()
  readonly approval?: ApprovalStatus;
}
