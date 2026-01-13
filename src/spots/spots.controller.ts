import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { SpotsService } from './spots.service';
import { UpdateSpotDto } from './dto/update-spot.dto';

@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @Get('dashboard')
  async getDashboard() {
    return await this.spotsService.getRealTimeStatus();
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpotDto: UpdateSpotDto
  ) {
    return await this.spotsService.update(id, updateSpotDto);
  }
}
