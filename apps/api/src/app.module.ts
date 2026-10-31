import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module.js';
import { SystemController } from './system.controller.js';

@Module({
  imports: [DatabaseModule],
  controllers: [SystemController],
})
export class AppModule {}
