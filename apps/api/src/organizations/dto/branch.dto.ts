import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const branchCode = /^[a-z0-9][a-z0-9-]{1,63}$/;

export class CreateBranchDto {
  @IsString() @Matches(branchCode) code!: string;
  @IsString() @MinLength(1) @MaxLength(160) displayName!: string;
  @IsString() @MinLength(1) @MaxLength(64) timeZone!: string;
}

export class UpdateBranchDto {
  @IsOptional() @IsString() @Matches(/.*\S.*/) @MinLength(1) @MaxLength(160) displayName?: string;
  @IsOptional() @IsString() @Matches(/.*\S.*/) @MinLength(1) @MaxLength(64) timeZone?: string;
}

export class ChangeBranchStatusDto { @IsIn(['ACTIVE', 'INACTIVE']) status!: 'ACTIVE' | 'INACTIVE'; }
