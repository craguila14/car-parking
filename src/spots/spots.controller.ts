import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SpotsService } from './spots.service';
import { UpdateSpotDto } from './dto/update-spot.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get('dashboard')
  async getDashboard() {
    return await this.spotsService.getRealTimeStatus();
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpotDto: UpdateSpotDto
  ) {
    return await this.spotsService.update(id, updateSpotDto);
  }
}
