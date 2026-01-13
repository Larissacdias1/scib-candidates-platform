import { IsString, IsOptional, MaxLength, IsIn, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Seniority } from '../entities/candidate.entity';

export class UpdateCandidateDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  surname?: string;

  @IsOptional()
  @IsIn(['junior', 'senior'])
  seniority?: Seniority;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @IsOptional()
  @IsBoolean()
  availability?: boolean;
}
