import { IsDateString, IsIn, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
const code=/^[a-z0-9][a-z0-9-]{1,63}$/; const text=/.*\S.*/;
export class CreateEmployeeDto { @IsString() @Matches(code) employeeCode!:string; @IsString() @Matches(text) @MinLength(1) @MaxLength(160) displayName!:string; }
export class UpdateEmployeeDto { @ValidateIf((_,v)=>v!==undefined) @IsString() @Matches(text) @MaxLength(160) displayName?:string; }
export class EmployeeStatusDto { @IsIn(['ACTIVE','INACTIVE']) status!: 'ACTIVE'|'INACTIVE'; }
export class WorkShiftStatusDto { @IsIn(['CANCELED']) status!: 'CANCELED'; }
export class AssignmentStatusDto { @IsIn(['INACTIVE','CANCELED']) status!: 'INACTIVE'|'CANCELED'; }
export class CreateShiftDto { @IsDateString() scheduledStart!:string; @IsDateString() scheduledEnd!:string; }
export class UpdateShiftDto { @ValidateIf((_,v)=>v!==undefined) @IsDateString() scheduledStart?:string; @ValidateIf((_,v)=>v!==undefined) @IsDateString() scheduledEnd?:string; }
