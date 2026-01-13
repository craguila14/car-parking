import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService],
  imports: [
    TypeOrmModule.forFeature([Reservation]),
  ],
})
export class ReservationsModule {}
