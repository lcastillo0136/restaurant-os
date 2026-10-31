import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Controller('system')
export class DatabaseController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('database')
  async health() {
    await this.prisma.ping();
    return {
      service: 'restaurant-os-api',
      status: 'ok',
      phase: '1.2',
      database: 'reachable',
    };
  }
}
