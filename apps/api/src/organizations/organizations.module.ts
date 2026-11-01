import { Module } from '@nestjs/common';
import { AuthorizationModule } from '../authorization/authorization.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { BranchesController, OrganizationsController } from './organizations.controller.js';
import { OrganizationsService } from './organizations.service.js';

@Module({ imports: [DatabaseModule, AuthorizationModule], controllers: [OrganizationsController, BranchesController], providers: [OrganizationsService] })
export class OrganizationsModule {}
