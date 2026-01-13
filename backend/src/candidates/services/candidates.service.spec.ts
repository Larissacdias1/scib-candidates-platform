import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { ExcelParserService } from './excel-parser.service';
import { Candidate } from '../entities/candidate.entity';

describe('CandidatesService', () => {
  let service: CandidatesService;
  let repository: jest.Mocked<Repository<Candidate>>;
  let excelParser: jest.Mocked<ExcelParserService>;

  const mockCandidate: Candidate = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'John',
    surname: 'Doe',
    seniority: 'senior',
    yearsOfExperience: 5,
    availability: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CandidatesService,
        {
          provide: getRepositoryToken(Candidate),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: ExcelParserService,
          useValue: {
            parse: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CandidatesService>(CandidatesService);
    repository = module.get(getRepositoryToken(Candidate));
    excelParser = module.get(ExcelParserService);
  });

  describe('create', () => {
    it('should create a candidate from form data and excel', async () => {
      const dto = { name: 'John', surname: 'Doe' };
      const fileBuffer = Buffer.from('test');

      excelParser.parse.mockReturnValue({
        seniority: 'senior',
        yearsOfExperience: 5,
        availability: true,
      });

      repository.create.mockReturnValue(mockCandidate);
      repository.save.mockResolvedValue(mockCandidate);

      const result = await service.create(dto, fileBuffer);

      expect(excelParser.parse).toHaveBeenCalledWith(fileBuffer);
      expect(repository.create).toHaveBeenCalledWith({
        name: 'John',
        surname: 'Doe',
        seniority: 'senior',
        yearsOfExperience: 5,
        availability: true,
      });
      expect(result.id).toBe(mockCandidate.id);
    });
  });

  describe('findAll', () => {
    it('should return all candidates ordered by creation date', async () => {
      repository.find.mockResolvedValue([mockCandidate]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John');
    });
  });

  describe('findOne', () => {
    it('should return a candidate by id', async () => {
      repository.findOne.mockResolvedValue(mockCandidate);

      const result = await service.findOne(mockCandidate.id);

      expect(result.name).toBe('John');
    });

    it('should throw NotFoundException when candidate does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an existing candidate', async () => {
      const updateDto = { name: 'John Updated' };
      const updatedCandidate = { ...mockCandidate, name: 'John Updated' };

      repository.findOne.mockResolvedValue(mockCandidate);
      repository.save.mockResolvedValue(updatedCandidate);

      const result = await service.update(mockCandidate.id, updateDto);

      expect(result.name).toBe('John Updated');
    });

    it('should throw NotFoundException when updating non-existent candidate', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-id', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a candidate', async () => {
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await expect(service.remove(mockCandidate.id)).resolves.not.toThrow();
    });

    it('should throw NotFoundException when deleting non-existent candidate', async () => {
      repository.delete.mockResolvedValue({ affected: 0, raw: {} });

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
});
