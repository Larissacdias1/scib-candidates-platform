import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { Seniority } from '../entities/candidate.entity';

export interface ExcelCandidateData {
  seniority: Seniority;
  yearsOfExperience: number;
  availability: boolean;
}

@Injectable()
export class ExcelParserService {
  parse(buffer: Buffer): ExcelCandidateData {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
      throw new BadRequestException('The Excel file is empty');
    }

    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (rows.length === 0) {
      throw new BadRequestException('No data found in Excel');
    }

    if (rows.length > 1) {
      throw new BadRequestException('The file must contain only one row of data');
    }

    return this.parseRow(rows[0]);
  }

  private parseRow(row: Record<string, unknown>): ExcelCandidateData {
    const seniority = this.extractSeniority(row);
    const yearsOfExperience = this.extractYearsOfExperience(row);
    const availability = this.extractAvailability(row);

    return { seniority, yearsOfExperience, availability };
  }

  private extractSeniority(row: Record<string, unknown>): Seniority {
    const value = this.findColumnValue(row, ['seniority', 'level']);
    const normalized = String(value).toLowerCase().trim();

    if (normalized !== 'junior' && normalized !== 'senior') {
      throw new BadRequestException('Seniority must be "junior" or "senior"');
    }

    return normalized as Seniority;
  }

  private extractYearsOfExperience(row: Record<string, unknown>): number {
    const value = this.findColumnValue(row, [
      'years',
      'yearsofexperience',
      'years_of_experience',
      'experience',
    ]);

    const parsed = Number(value);

    if (isNaN(parsed) || parsed < 0 || parsed > 50) {
      throw new BadRequestException('Years of experience must be a number between 0 and 50');
    }

    return Math.floor(parsed);
  }

  private extractAvailability(row: Record<string, unknown>): boolean {
    const value = this.findColumnValue(row, ['availability', 'available']);

    if (typeof value === 'boolean') {
      return value;
    }

    const normalized = String(value).toLowerCase().trim();
    return normalized === 'true' || normalized === 'yes' || normalized === '1';
  }

  private findColumnValue(row: Record<string, unknown>, possibleNames: string[]): unknown {
    const keys = Object.keys(row);

    for (const name of possibleNames) {
      const found = keys.find((k) => k.toLowerCase().replace(/[_\s]/g, '') === name.toLowerCase());
      if (found && row[found] !== undefined && row[found] !== '') {
        return row[found];
      }
    }

    throw new BadRequestException(`Column not found. Expected: ${possibleNames.join(', ')}`);
  }
}
