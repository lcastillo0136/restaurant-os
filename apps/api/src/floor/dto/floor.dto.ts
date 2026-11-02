import { IsIn, IsInt, IsString, IsUUID, Matches, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';
const code=/^[a-z0-9][a-z0-9-]{1,63}$/; const text=/.*\S.*/;
export class CreateAreaDto { @IsString() @Matches(code) code!:string; @IsString() @Matches(text) @MinLength(1) @MaxLength(160) displayName!:string; }
export class UpdateAreaDto { @ValidateIf((_,v)=>v!==undefined) @IsString() @Matches(text) @MinLength(1) @MaxLength(160) displayName?:string; }
export class AreaStatusDto { @IsIn(['ACTIVE','INACTIVE']) status!: 'ACTIVE'|'INACTIVE'; }
export class CreateTableDto { @IsString() @Matches(code) code!:string; @IsUUID() areaId!:string; @IsInt() @Min(1) @Max(1000) capacity!:number; }
export class UpdateTableDto { @ValidateIf((_,v)=>v!==undefined) @IsUUID() areaId?:string; @ValidateIf((_,v)=>v!==undefined) @IsInt() @Min(1) @Max(1000) capacity?:number; }
export class TableStatusDto { @IsIn(['AVAILABLE','CLEANING','RESERVED','BLOCKED','OUT_OF_SERVICE']) status!: 'AVAILABLE'|'CLEANING'|'RESERVED'|'BLOCKED'|'OUT_OF_SERVICE'; }
export class CloseTableSessionDto { @IsInt() @Min(1) version!:number; }
