import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { SecurityAuditModule } from '../security-audit/security-audit.module.js';
import { AuthController } from './auth.controller.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { LoginRateLimiterService } from './login-rate-limiter.service.js';
import { PasswordService } from './password.service.js';
import { SessionService } from './session.service.js';

@Module({
  imports: [DatabaseModule, SecurityAuditModule, AuthorizationModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, PasswordService, SessionService, LoginRateLimiterService],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
