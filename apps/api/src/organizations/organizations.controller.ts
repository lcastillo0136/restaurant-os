import { Body, Controller, Get, Patch, Post, Req } from '@nestjs/common';
import { RequireAuthorizationScope, RequirePermissions } from '../authorization/authorization.decorators.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto.js';
import { UpdateOrganizationDto } from './dto/organization.dto.js';
import { OrganizationsService } from './organizations.service.js';

const routeParam = (request: AuthenticatedRequest, name: string): string => {
  const value = request.params[name];
  if (typeof value !== 'string') throw new Error('Parámetro de ruta inválido.');
  return value;
};

@Controller('organizations/:organizationId')
@RequireAuthorizationScope({ organizationParam: 'organizationId' })
export class OrganizationsController {
  constructor(private readonly organizations: OrganizationsService) {}
  @Get() @RequirePermissions('organizations.read') get(@Req() request: AuthenticatedRequest) { return this.organizations.organization(routeParam(request, 'organizationId')); }
  @Patch() @RequirePermissions('organizations.manage') update(@Req() request: AuthenticatedRequest, @Body() dto: UpdateOrganizationDto) { return this.organizations.updateOrganization(routeParam(request, 'organizationId'), dto, request.auth!.userId); }
  @Get('branches') @RequirePermissions('branches.read') branches(@Req() request: AuthenticatedRequest) { return this.organizations.branches(routeParam(request, 'organizationId')); }
  @Post('branches') @RequirePermissions('branches.manage') createBranch(@Req() request: AuthenticatedRequest, @Body() dto: CreateBranchDto) { return this.organizations.createBranch(routeParam(request, 'organizationId'), dto, request.auth!.userId); }
}

@Controller('organizations/:organizationId/branches/:branchId')
@RequireAuthorizationScope({ organizationParam: 'organizationId', branchParam: 'branchId' })
export class BranchesController {
  constructor(private readonly organizations: OrganizationsService) {}
  @Get() @RequirePermissions('branches.read') get(@Req() request: AuthenticatedRequest) { return this.organizations.branch(routeParam(request, 'organizationId'), routeParam(request, 'branchId')); }
  @Patch() @RequirePermissions('branches.manage') update(@Req() request: AuthenticatedRequest, @Body() dto: UpdateBranchDto) { return this.organizations.updateBranch(routeParam(request, 'organizationId'), routeParam(request, 'branchId'), dto, request.auth!.userId); }
}
