import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { resolveWebsocketEnvironment } from '../environment.js';
import { RealtimeGateway, websocketEnvironmentToken } from './realtime.gateway.js';

@Module({
  imports: [AuthModule, AuthorizationModule],
  providers: [
    {
      provide: websocketEnvironmentToken,
      useFactory: resolveWebsocketEnvironment,
    },
    RealtimeGateway,
  ],
})
export class RealtimeModule {}
