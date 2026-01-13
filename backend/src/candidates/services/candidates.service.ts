import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../entities/candidate.entity';
import { CreateCandidateDto, UpdateCandidateDto, CandidateResponseDto } from '../dto';
import { ExcelParserService, ExcelCandidateData } from './excel-parser.service';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly candidateRepository: Repository<Candidate>,
    private readonly excelParser: ExcelParserService,
  ) {}

  async create(dto: CreateCandidateDto, fileBuffer: Buffer): Promise<CandidateResponseDto> {
    const excelData = this.excelParser.parse(fileBuffer);

    const candidate = this.candidateRepository.create({
      name: dto.name,
      surname: dto.surname,
      seniority: excelData.seniority,
      yearsOfExperience: excelData.yearsOfExperience,
      availability: excelData.availability,
    });

    const saved = await this.candidateRepository.save(candidate);
    return CandidateResponseDto.fromEntity(saved);
  }

  async findAll(): Promise<CandidateResponseDto[]> {
    const candidates = await this.candidateRepository.find({
      order: { createdAt: 'DESC' },
    });

    return candidates.map(CandidateResponseDto.fromEntity);
  }

  async findOne(id: string): Promise<CandidateResponseDto> {
    const candidate = await this.candidateRepository.findOne({ where: { id } });

    if (!candidate) {
      throw new NotFoundException(`Candidate not found`);
    }

    return CandidateResponseDto.fromEntity(candidate);
  }

  async update(id: string, dto: UpdateCandidateDto): Promise<CandidateResponseDto> {
    const candidate = await this.candidateRepository.findOne({ where: { id } });

    if (!candidate) {
      throw new NotFoundException(`Candidate not found`);
    }

    Object.assign(candidate, dto);
    const updated = await this.candidateRepository.save(candidate);

    return CandidateResponseDto.fromEntity(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.candidateRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Candidate not found`);
    }
  }
}
