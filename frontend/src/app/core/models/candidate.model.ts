export type Seniority = 'intern' | 'trainee' | 'junior' | 'mid' | 'senior';

export interface Candidate {
  id: string;
  name: string;
  surname: string;
  seniority: Seniority;
  yearsOfExperience: number;
  availability: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCandidatePayload {
  name: string;
  surname: string;
  file: File;
}
