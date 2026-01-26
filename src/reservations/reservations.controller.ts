import { Controller, Post, Body, Patch, Param, Get, ParseUUIDPipe, Delete, UseGuards, Req, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { CreateWalkInDto } from './dto/create-walk-in.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
  return await this.reservationsService.findAll();
  }

@Get('my-history')
@UseGuards(AuthGuard('jwt'))
async getMyReservations(@Req() req: any) {

  if (!req.user || !req.user.userId) {
    throw new UnauthorizedException('No se pudo identificar al usuario');
  }

  const userId = req.user.userId;
  return await this.reservationsService.findByUser(userId);
}


  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
  @Body() createReservationDto: CreateReservationDto,
  @Req () req
  ) {
  const userId = req.user.userId;
    return await this.reservationsService.create({...createReservationDto}, userId);
  }

  @Post('/walk-in')
  @Roles(UserRole.ADMIN)
  async createWalkIn(@Body() dto: CreateWalkInDto) {
      return await this.reservationsService.createWalkIn(dto);
  }


  @Patch(':id')
  async update(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return await this.reservationsService.update(id, updateReservationDto);
  }

  @Patch(':id/check-in')
  @Roles(UserRole.ADMIN)
  async checkIn(@Param('id', ParseUUIDPipe) id: string) {
    return await this.reservationsService.checkIn(id);
}

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async remove(
  @Param('id', ParseUUIDPipe) id: string,
) {
    return await this.reservationsService.remove(id);
}

  @Patch(':id/check-out')
  @Roles(UserRole.ADMIN)
  async checkOut(@Param('id', ParseUUIDPipe) id: string) {
    return await this.reservationsService.checkOut(id);
}

  @Patch(':id/cancel')
  async cancel(
  @Param('id', ParseUUIDPipe) id: string,
  @Req() req
) {
  const { userId, role } = req.user;
    return await this.reservationsService.cancel(id, userId, role);
}

}