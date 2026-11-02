import { IsIn, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

const branchCode = /^[a-z0-9][a-z0-9-]{1,63}$/;

export class CreateBranchDto {
  @IsString() @Matches(branchCode) code!: string;
  @IsString() @Matches(/.*\S.*/) @MinLength(1) @MaxLength(160) displayName!: string;
  @IsString() @MinLength(1) @MaxLength(64) timeZone!: string;
}

export class UpdateBranchDto {
  @ValidateIf((_, value) => value !== undefined) @IsString() @Matches(/.*\S.*/) @MinLength(1) @MaxLength(160) displayName?: string;
  @ValidateIf((_, value) => value !== undefined) @IsString() @Matches(/.*\S.*/) @MinLength(1) @MaxLength(64) timeZone?: string;
}

export class ChangeBranchStatusDto { @IsIn(['ACTIVE', 'INACTIVE']) status!: 'ACTIVE' | 'INACTIVE'; }
