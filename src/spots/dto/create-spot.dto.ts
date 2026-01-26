import { IsString, IsNotEmpty, IsBoolean, IsOptional } from "class-validator";

export class CreateSpotDto {
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsBoolean()
  @IsOptional()
  isSpecial?: boolean; 
}