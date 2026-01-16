import { IsDateString, IsNotEmpty, IsUUID, IsInt, MinDate, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsInt()
  @IsNotEmpty()
  spotId: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  endTime: Date;
}