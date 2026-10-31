import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { resolveDatabaseUrl } from './database-environment.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const adapter = new PrismaPg({ connectionString: resolveDatabaseUrl() });
    super({ adapter });
  }

  async ping(): Promise<void> {
    await this.$queryRaw`SELECT 1`;
  }

  async onModuleInit(): Promise<void> {
    this.logger.log(JSON.stringify({ event: 'prisma_initialized', connectionMode: 'lazy-readiness' }));
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log(JSON.stringify({ event: 'prisma_disconnected' }));
  }
}
