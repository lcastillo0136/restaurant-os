import { Controller, Get } from '@nestjs/common';

@Controller('system')
export class SystemController {
  @Get('health')
  health() {
    return {
      service: 'restaurant-os-api',
      status: 'ok',
      phase: '1.2',
    };
  }

  @Get('status')
  status() {
    return {
      service: 'restaurant-os-api',
      phase: '1.2',
      status: 'database-foundation-ready',
      database: 'migration-managed',
    };
  }
}
