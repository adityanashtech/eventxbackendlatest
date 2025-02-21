import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsDate, IsBoolean, IsOptional  } from 'class-validator';

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
  @IsNotEmpty()
  readonly image: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  readonly registration_fee: number;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  readonly trending: boolean;
}


export class UpdateEventDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly event_name?: string;
  
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly location?: string;
  
    @ApiProperty({ required: false })
    @IsDate()
    @IsOptional()
    readonly event_start_date?: Date;
  
    @ApiProperty({ required: false })
    @IsDate()
    @IsOptional()
    readonly event_end_date?: Date;
  
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly description?: string;
  
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly user_type?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsNotEmpty()
    readonly event_type: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsNotEmpty()
    readonly image: string;
  
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    readonly status?: string;
  
    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    readonly registration_fee?: number;
  
    @ApiProperty({ required: false })
    @IsBoolean()
    @IsOptional()
    readonly trending?: boolean;
  }
  
