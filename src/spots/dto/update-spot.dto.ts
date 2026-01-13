import { PartialType } from '@nestjs/mapped-types';
import { CreateSpotDto } from './create-spot.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSpotDto extends PartialType(CreateSpotDto) {

  @IsString()
  @IsOptional()
  identifier?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isSpecial?: boolean;

}
