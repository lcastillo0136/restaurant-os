import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class UpdateOrganizationDto {
  @IsString()
  @Matches(/.*\S.*/)
  @MinLength(1)
  @MaxLength(160)
  displayName!: string;
}
