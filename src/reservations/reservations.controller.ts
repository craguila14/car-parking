import { Controller, Post, Body, Patch, Param, Get, ParseUUIDPipe, Delete } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}


  @Post()
  async create(@Body() createReservationDto: CreateReservationDto) {
    return await this.reservationsService.create(createReservationDto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return await this.reservationsService.update(id, updateReservationDto);
  }

  @Patch(':id/check-in')
  async checkIn(@Param('id', ParseUUIDPipe) id: string) {
    return await this.reservationsService.checkIn(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.reservationsService.remove(id);
  }

  @Patch(':id/check-out')
  async checkOut(@Param('id', ParseUUIDPipe) id: string) {
    return await this.reservationsService.checkOut(id);
  }

}