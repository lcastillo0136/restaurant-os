import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { SystemController } from './system.controller.js';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SystemController],
})
export class AppModule {}
