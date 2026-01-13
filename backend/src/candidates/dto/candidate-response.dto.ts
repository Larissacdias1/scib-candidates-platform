import { Candidate, Seniority } from '../entities/candidate.entity';

export class CandidateResponseDto {
  id: string;
  name: string;
  surname: string;
  seniority: Seniority;
  yearsOfExperience: number;
  availability: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(entity: Candidate): CandidateResponseDto {
    const dto = new CandidateResponseDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.surname = entity.surname;
    dto.seniority = entity.seniority;
    dto.yearsOfExperience = entity.yearsOfExperience;
    dto.availability = entity.availability;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
