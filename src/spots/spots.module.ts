import { Module } from '@nestjs/common';
import { SpotsService } from './spots.service';
import { SpotsController } from './spots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Spot } from './entities/spot.entity';

@Module({
  controllers: [SpotsController],
  providers: [SpotsService],
  imports: [
    TypeOrmModule.forFeature([Spot]),
  ]
})
export class SpotsModule {}
