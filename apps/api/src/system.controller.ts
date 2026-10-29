import { Controller, Get } from '@nestjs/common';

@Controller('system')
export class SystemController {
  @Get('status')
  status() {
    return {
      service: 'restaurant-os-api',
      phase: '0.1',
      status: 'scaffold',
    };
  }
}
