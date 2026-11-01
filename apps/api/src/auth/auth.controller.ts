import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { getRequestId } from '../common/http/request-context.middleware.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { AuthGuard } from './auth.guard.js';
import { AuthService } from './auth.service.js';
import { AuthenticatedRequest } from './auth.types.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshSessionDto } from './dto/refresh-session.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly authorization: AuthorizationService,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    return this.auth.login(dto.identifier, dto.password, getRequestId(response));
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshSessionDto, @Res({ passthrough: true }) response: Response) {
    return this.auth.refresh(dto.refreshToken, getRequestId(response));
  }

  @Post('logout')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async logout(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response): Promise<void> {
    await this.auth.logout(request.auth!, getRequestId(response));
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() request: AuthenticatedRequest) {
    const identity = request.auth!;
    return {
      user: this.auth.currentUser(identity),
      grants: await this.authorization.getGrants(identity.userId),
    };
  }
}
