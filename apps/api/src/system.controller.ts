import { Controller, Get } from '@nestjs/common';

@Controller('system')
export class SystemController {
  @Get('health')
  health() {
    return {
      service: 'restaurant-os-api',
      status: 'ok',
      phase: '1.1',
    };
  }

  @Get('status')
  status() {
    return {
      service: 'restaurant-os-api',
      phase: '1.1',
      status: 'environment-ready',
      database: 'preliminary-infrastructure-only',
    };
  }
}
