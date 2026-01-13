import { BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { ExcelParserService } from './excel-parser.service';

describe('ExcelParserService', () => {
  let service: ExcelParserService;

  beforeEach(() => {
    service = new ExcelParserService();
  });

  const createExcelBuffer = (data: Record<string, unknown>[]): Buffer => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  };

  describe('parse', () => {
    it('should parse valid excel data', () => {
      const buffer = createExcelBuffer([
        { seniority: 'senior', years: 5, availability: true },
      ]);

      const result = service.parse(buffer);

      expect(result).toEqual({
        seniority: 'senior',
        yearsOfExperience: 5,
        availability: true,
      });
    });

    it('should handle junior seniority', () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: 2, availability: false },
      ]);

      const result = service.parse(buffer);

      expect(result.seniority).toBe('junior');
      expect(result.availability).toBe(false);
    });

    it('should throw when excel has more than one row', () => {
      const buffer = createExcelBuffer([
        { seniority: 'junior', years: 2, availability: true },
        { seniority: 'senior', years: 5, availability: false },
      ]);

      expect(() => service.parse(buffer)).toThrow(BadRequestException);
    });

    it('should throw for invalid seniority value', () => {
      const buffer = createExcelBuffer([
        { seniority: 'mid', years: 3, availability: true },
      ]);

      expect(() => service.parse(buffer)).toThrow('Seniority must be "junior" or "senior"');
    });

    it('should throw for negative years of experience', () => {
      const buffer = createExcelBuffer([
        { seniority: 'senior', years: -1, availability: true },
      ]);

      expect(() => service.parse(buffer)).toThrow(BadRequestException);
    });

    it('should handle string boolean values', () => {
      const buffer = createExcelBuffer([
        { seniority: 'senior', years: 5, availability: 'yes' },
      ]);

      const result = service.parse(buffer);
      expect(result.availability).toBe(true);
    });

    it('should handle alternative column names', () => {
      const buffer = createExcelBuffer([
        { Seniority: 'JUNIOR', YearsOfExperience: 3, Availability: 'true' },
      ]);

      const result = service.parse(buffer);

      expect(result.seniority).toBe('junior');
      expect(result.yearsOfExperience).toBe(3);
      expect(result.availability).toBe(true);
    });
  });
});
