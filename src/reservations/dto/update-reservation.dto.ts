import { IsDateString, IsOptional } from 'class-validator';

export class UpdateReservationDto {
  @IsDateString()
  @IsOptional()
  startTime?: Date;

  @IsDateString()
  @IsOptional()
  endTime?: Date;
}