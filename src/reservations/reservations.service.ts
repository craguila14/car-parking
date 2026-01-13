import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
  ) {}

  
  async create(dto: CreateReservationDto) {
    const hasConflict = await this.checkAvailability(dto.spotId, dto.startTime, dto.endTime);

    if (hasConflict) {
      throw new BadRequestException('El espacio ya está ocupado en ese horario.');
    }

    const newReservation = this.reservationRepo.create({
    startTimeScheduled: dto.startTime,
    endTimeScheduled: dto.endTime,
    user: { id: dto.userId }, 
    spot: { id: dto.spotId },
    status: ReservationStatus.CONFIRMED,

  });
    return await this.reservationRepo.save(newReservation);
  }

 
  async update(id: string, dto: UpdateReservationDto) {
  const reservation = await this.reservationRepo.findOne({ 
    where: { id }, 
    relations: ['spot'] 
  });
  
  if (!reservation) throw new NotFoundException('Reserva no encontrada');

  const startTime = dto.startTime ?? reservation.startTimeScheduled;
  const endTime = dto.endTime ?? reservation.endTimeScheduled;

  const hasConflict = await this.checkAvailability(
    reservation.spot.id, 
    startTime, 
    endTime, 
    id 
  );

  if (hasConflict) {
    throw new BadRequestException('No hay disponibilidad para el nuevo horario.');
  }

  if (dto.startTime) reservation.startTimeScheduled = dto.startTime;
  if (dto.endTime) reservation.endTimeScheduled = dto.endTime;

  return await this.reservationRepo.save(reservation);
}


  private async checkAvailability(spotId: number, start: Date, end: Date, excludeId?: string): Promise<boolean> {
    const query = this.reservationRepo.createQueryBuilder('res')
      .where('res.spotId = :spotId', { spotId })
      .andWhere('res.status IN (:...statuses)', { 
        statuses: [ReservationStatus.CONFIRMED, ReservationStatus.ACTIVE] 
      })
      .andWhere('res.startTimeScheduled < :end', { end })
      .andWhere('res.endTimeScheduled > :start', { start });

    if (excludeId) {
      query.andWhere('res.id != :excludeId', { excludeId });
    }

    const conflict = await query.getOne();
    return !!conflict; 
  }


  async remove(id: string) {
  const reservation = await this.reservationRepo.findOne({ where: { id } });
  if (!reservation) throw new NotFoundException('La reserva no existe');

  if (reservation.status === ReservationStatus.ACTIVE) {
    throw new BadRequestException('No se puede eliminar una reserva con el auto dentro del parking');
  }

  const deletedReservation = await this.reservationRepo.remove(reservation);

  return { message: 'Reserva eliminada correctamente', reservation: deletedReservation };
}


  async checkOut(id: string) {
  const reservation = await this.reservationRepo.findOne({ where: { id } });
  
  if (!reservation) throw new NotFoundException('Reserva no encontrada');
  if (reservation.status !== ReservationStatus.ACTIVE) {
    throw new BadRequestException('Solo se puede dar salida a reservas activas (Check-in previo)');
  }

  reservation.actualCheckOut = new Date();
  reservation.status = ReservationStatus.COMPLETED;

  return await this.reservationRepo.save(reservation);
}

 
  async checkIn(id: string) {
    return await this.reservationRepo.update(id, {
      actualCheckIn: new Date(),
      status: ReservationStatus.ACTIVE
    });
  }
}