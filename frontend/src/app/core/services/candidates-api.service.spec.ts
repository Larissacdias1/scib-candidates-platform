import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CandidatesApiService } from './candidates-api.service';
import { Candidate } from '../models/candidate.model';

describe('CandidatesApiService', () => {
  let service: CandidatesApiService;
  let httpMock: HttpTestingController;

  const mockCandidate: Candidate = {
    id: 'abc-123',
    name: 'John',
    surname: 'Doe',
    seniority: 'senior',
    yearsOfExperience: 5,
    availability: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CandidatesApiService],
    });

    service = TestBed.inject(CandidatesApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getAll', () => {
    it('fetches candidates from correct endpoint', () => {
      service.getAll().subscribe((candidates) => {
        expect(candidates).toHaveLength(1);
        expect(candidates[0].name).toBe('John');
      });

      const req = httpMock.expectOne('http://localhost:3000/api/candidates');
      expect(req.request.method).toBe('GET');
      req.flush([mockCandidate]);
    });

    it('parses date strings into Date objects', () => {
      const rawResponse = {
        ...mockCandidate,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
      };

      service.getAll().subscribe((candidates) => {
        expect(candidates[0].createdAt).toBeInstanceOf(Date);
        expect(candidates[0].updatedAt).toBeInstanceOf(Date);
      });

      const req = httpMock.expectOne('http://localhost:3000/api/candidates');
      req.flush([rawResponse]);
    });
  });

  describe('getById', () => {
    it('fetches single candidate by ID', () => {
      service.getById('abc-123').subscribe((candidate) => {
        expect(candidate.id).toBe('abc-123');
        expect(candidate.name).toBe('John');
      });

      const req = httpMock.expectOne('http://localhost:3000/api/candidates/abc-123');
      expect(req.request.method).toBe('GET');
      req.flush(mockCandidate);
    });
  });

  describe('create', () => {
    it('sends FormData to correct endpoint', () => {
      const file = new File([''], 'data.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      service.create({ name: 'John', surname: 'Doe', file }).subscribe((candidate) => {
        expect(candidate.name).toBe('John');
      });

      const req = httpMock.expectOne('http://localhost:3000/api/candidates');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush(mockCandidate);
    });
  });

  describe('delete', () => {
    it('sends DELETE request to correct endpoint', () => {
      service.delete('abc-123').subscribe();

      const req = httpMock.expectOne('http://localhost:3000/api/candidates/abc-123');
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('error handling', () => {
    it('transforms API error messages', () => {
      service.getAll().subscribe({
        error: (err) => {
          expect(err.message).toBe('Server error');
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/candidates');
      req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
    });

    it('handles array error messages', () => {
      service.getAll().subscribe({
        error: (err) => {
          expect(err.message).toBe('Field required, Invalid format');
        },
      });

      const req = httpMock.expectOne('http://localhost:3000/api/candidates');
      req.flush(
        { message: ['Field required', 'Invalid format'] },
        { status: 400, statusText: 'Bad Request' }
      );
    });
  });
});
