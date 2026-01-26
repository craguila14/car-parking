import { Type } from "class-transformer";
import { IsNumber, IsString, IsDate, IsNotEmpty, IsOptional, IsInt } from "class-validator";

export class CreateWalkInDto {
  @IsInt()
  @IsNotEmpty()
  spotId: number;

  @IsString()
  @IsNotEmpty()
  licensePlate: string; 

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startTime?: Date;

}