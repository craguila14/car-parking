import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSpotDto } from './dto/create-spot.dto';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { Spot } from './entities/spot.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
      'res', 'res.status = :status', 
      { status: 'active' })
    .getMany();
}
}
