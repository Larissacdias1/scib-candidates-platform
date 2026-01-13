import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './services';

describe('CandidatesController', () => {
  let controller: CandidatesController;
  let service: jest.Mocked<CandidatesService>;

  const mockResponse = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Jane',
    surname: 'Smith',
    seniority: 'senior' as const,
    yearsOfExperience: 8,
    availability: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CandidatesController],
      providers: [
        {
          provide: CandidatesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CandidatesController>(CandidatesController);
    service = module.get(CandidatesService);
  });

  describe('create', () => {
    it('should create a candidate with form data and file', async () => {
      const dto = { name: 'Jane', surname: 'Smith' };
      const mockFile = {
        buffer: Buffer.from('test'),
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      } as Express.Multer.File;

      service.create.mockResolvedValue(mockResponse);

      const result = await controller.create(dto, mockFile);

      expect(service.create).toHaveBeenCalledWith(dto, mockFile.buffer);
      expect(result.name).toBe('Jane');
    });

    it('should throw when file is missing', async () => {
      const dto = { name: 'Jane', surname: 'Smith' };

      await expect(controller.create(dto, undefined as unknown as Express.Multer.File)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all candidates', async () => {
      service.findAll.mockResolvedValue([mockResponse]);

      const result = await controller.findAll();

      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a single candidate', async () => {
      service.findOne.mockResolvedValue(mockResponse);

      const result = await controller.findOne(mockResponse.id);

      expect(result.name).toBe('Jane');
    });
  });

  describe('update', () => {
    it('should update a candidate', async () => {
      const updateDto = { availability: false };
      const updated = { ...mockResponse, availability: false };

      service.update.mockResolvedValue(updated);

      const result = await controller.update(mockResponse.id, updateDto);

      expect(result.availability).toBe(false);
    });
  });

  describe('remove', () => {
    it('should delete a candidate', async () => {
      service.remove.mockResolvedValue();

      await expect(controller.remove(mockResponse.id)).resolves.not.toThrow();
    });
  });
});
