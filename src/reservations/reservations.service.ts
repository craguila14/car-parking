import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { CreateWalkInDto } from './dto/create-walk-in.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
  ) {}

  async findAll() {
  return await this.reservationRepo.find({
    relations: ['user', 'spot'],
    order: {
      startTimeScheduled: 'ASC',
    },
  });
}

async findByUser(userId: string) {
  return await this.reservationRepo.find({
    where: { user: { id: userId } },
    relations: ['spot'],
    order: { createdAt: 'DESC' }
  });
}

  async create(dto: CreateReservationDto, userId: string) {
    const hasConflict = await this.checkAvailability(dto.spotId, dto.startTime, dto.endTime);

    if (hasConflict) {
      throw new BadRequestException('El espacio ya está ocupado en ese horario.');
    }

    const newReservation = this.reservationRepo.create({
    startTimeScheduled: dto.startTime,
    endTimeScheduled: dto.endTime,
    user: { id: userId }, 
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



async cancel(id: string, userId: string, role: string) {
  const reservation = await this.reservationRepo.findOne({ 
    where: { id },
    relations: ['user'] 
  });

  if (!reservation) throw new NotFoundException('Reserva no encontrada');

  if (role !== 'admin' && reservation.user.id !== userId) {
    throw new ForbiddenException('No tienes permiso para cancelar esta reserva');
  }

  if (reservation.status === ReservationStatus.COMPLETED || 
      reservation.status === ReservationStatus.CANCELLED) {
    throw new BadRequestException('La reserva ya ha finalizado o ya estaba cancelada');
  }
  
  if (reservation.status === ReservationStatus.ACTIVE) {
    throw new BadRequestException('No puedes cancelar una reserva con el auto ya estacionado. Debes hacer Check-out.');
  }

  reservation.status = ReservationStatus.CANCELLED;
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
    throw new BadRequestException('No se puede eliminar una reserva activa.');
  }

  await this.reservationRepo.remove(reservation);
  return { message: 'Reserva eliminada por el administrador', id };
}

async checkIn(id: string) {
  const reservation = await this.reservationRepo.findOne({ where: { id } });
  if (!reservation) throw new NotFoundException('Reserva no encontrada');
  
  if (reservation.status !== ReservationStatus.CONFIRMED) {
    throw new BadRequestException('Solo se puede dar entrada a reservas confirmadas');
  }

  reservation.actualCheckIn = new Date();
  reservation.status = ReservationStatus.ACTIVE;
  return await this.reservationRepo.save(reservation);
}

async checkOut(id: string) {
  const reservation = await this.reservationRepo.findOne({ where: { id } });
  if (!reservation) throw new NotFoundException('Reserva no encontrada');
  
  if (reservation.status !== ReservationStatus.ACTIVE) {
    throw new BadRequestException('Solo se puede dar salida a reservas activas');
  }

  reservation.actualCheckOut = new Date();
  reservation.status = ReservationStatus.COMPLETED;
  return await this.reservationRepo.save(reservation);
}

async createWalkIn(dto: CreateWalkInDto) {


  const reservationData = {
    spot: { id: dto.spotId } as any,
    adminNotes: dto.licensePlate,
    startTime: dto.startTime || new Date(),
    status: ReservationStatus.ACTIVE,
    actualCheckIn: new Date(), 
  };

  const reservation = this.reservationRepo.create(reservationData);

  return await this.reservationRepo.save(reservation);
}
}