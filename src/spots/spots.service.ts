import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { Spot } from './entities/spot.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReservationStatus } from 'src/reservations/entities/reservation.entity';

@Injectable()
export class SpotsService {

 constructor(
    @InjectRepository(Spot)
    private readonly spotRepo: Repository<Spot>,
  ) {}

async update(id: number, dto: UpdateSpotDto) {
    const spot = await this.spotRepo.findOne({ where: { id } });
    if (!spot) throw new NotFoundException(`El spot #${id} no existe`);
    Object.assign(spot, dto);
    return await this.spotRepo.save(spot);
  }


async getRealTimeStatus() {
  return await this.spotRepo.createQueryBuilder('spot')
    .leftJoinAndSelect(
      'spot.reservations', 
      'res', 
      'res.status = :status', 
      { status: 'active' }
    )
    .leftJoinAndSelect('res.user', 'usuarioRelacionado') 
    .getMany();
}

async findAvailableSpots(startTime: Date, endTime: Date) {
  return await this.spotRepo.createQueryBuilder('spot')
    .where(qb => {
      const subQuery = qb.subQuery()
        .select('reservation.spotId')
        .from('Reservation', 'reservation')
        .where('reservation.status IN (:...statuses)', { 
          statuses: [ReservationStatus.CONFIRMED, ReservationStatus.ACTIVE] 
        })
        .andWhere(
          '(reservation.startTimeScheduled < :end AND reservation.endTimeScheduled > :start)',
          { start: startTime, end: endTime }
        )
        .getQuery();
      return 'spot.id NOT IN ' + subQuery;
    })
    .getMany();
}

async create(dto: CreateSpotDto) {
    const newSpot = this.spotRepo.create(dto);
    return await this.spotRepo.save(newSpot);
  }

  async remove(id: number) {
    const spot = await this.spotRepo.findOne({ where: { id } });
    if (!spot) throw new NotFoundException(`El spot #${id} no existe`);
    
    await this.spotRepo.remove(spot);
    return { deleted: true, id };
  }
}
