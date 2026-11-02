import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, ParseUUIDPipe, Patch, Post, Req } from '@nestjs/common';
import { RequireAuthorizationScope, RequirePermissions } from '../authorization/authorization.decorators.js';
import { AuthorizationService } from '../authorization/authorization.service.js';
import { AuthenticatedRequest } from '../auth/auth.types.js';
import { ChangeBranchStatusDto, CreateBranchDto, UpdateBranchDto } from './dto/branch.dto.js';
import { UpdateOrganizationDto } from './dto/organization.dto.js';
import { OrganizationsService } from './organizations.service.js';

const routeParam = (request: AuthenticatedRequest, name: string): string => {
  const value = request.params[name];
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) throw new BadRequestException();
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

@Controller('organizations/:organizationId/branches/:branchId/status')
@RequireAuthorizationScope({ organizationParam: 'organizationId' })
export class BranchStatusController {
  constructor(private readonly organizations: OrganizationsService, private readonly authorization: AuthorizationService) {}
  @Patch() @RequirePermissions('branches.manage')
  async change(@Req() request: AuthenticatedRequest, @Param('organizationId', new ParseUUIDPipe()) organizationId: string, @Param('branchId', new ParseUUIDPipe()) branchId: string, @Body() dto: ChangeBranchStatusDto) {
    const grants = await this.authorization.getGrants(request.auth!.userId);
    if (!grants.some((grant) => grant.scope === 'ORGANIZATION' && grant.organizationId === organizationId && grant.permissions.includes('branches.manage'))) throw new ForbiddenException();
    return this.organizations.changeBranchStatus(organizationId, branchId, dto, request.auth!.userId);
  }
}
