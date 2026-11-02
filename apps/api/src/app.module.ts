import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { RealtimeModule } from './realtime/realtime.module.js';
import { OrganizationsModule } from './organizations/organizations.module.js';
import { SystemController } from './system.controller.js';

@Module({
  imports: [DatabaseModule, AuthModule, RealtimeModule, OrganizationsModule],
  controllers: [SystemController],
})
export class AppModule {}
