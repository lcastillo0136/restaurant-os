import { Controller, Get } from '@nestjs/common';

@Controller('system')
export class SystemController {
  @Get('health')
  health() {
    return {
      service: 'restaurant-os-api',
      status: 'ok',
      phase: '1.3',
    };
  }

  @Get('status')
  status() {
    return {
      service: 'restaurant-os-api',
      phase: '1.3',
      status: 'backend-core-ready',
      database: 'readiness-endpoint-available',
    };
  }
}
