import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { CandidatesStore } from './candidates.store';
import { CandidatesApiService } from '../services/candidates-api.service';
import { Candidate } from '../models/candidate.model';

describe('CandidatesStore', () => {
  let store: CandidatesStore;
  let api: jest.Mocked<CandidatesApiService>;
  let snackBar: jest.Mocked<MatSnackBar>;

  const mockCandidate: Candidate = {
    id: '1',
    name: 'John',
    surname: 'Doe',
    seniority: 'senior',
    yearsOfExperience: 5,
    availability: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    api = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<CandidatesApiService>;

    snackBar = { open: jest.fn() } as unknown as jest.Mocked<MatSnackBar>;

    TestBed.configureTestingModule({
      providers: [
        CandidatesStore,
        { provide: CandidatesApiService, useValue: api },
        { provide: MatSnackBar, useValue: snackBar },
      ],
    });

    store = TestBed.inject(CandidatesStore);
  });

  describe('loadCandidates', () => {
    it('fetches candidates on first call', fakeAsync(() => {
      api.getAll.mockReturnValue(of([mockCandidate]));

      let result: Candidate[] = [];
      store.candidates$.subscribe((c) => (result = c));

      store.loadCandidates();
      tick();

      expect(result).toHaveLength(1);
    }));

    it('skips fetch when already loaded', fakeAsync(() => {
      api.getAll.mockReturnValue(of([mockCandidate]));

      store.loadCandidates();
      tick();
      store.loadCandidates();

      expect(api.getAll).toHaveBeenCalledTimes(1);
    }));

    it('sets error on failure', fakeAsync(() => {
      api.getAll.mockReturnValue(throwError(() => new Error('Network error')));

      let error: string | null = null;
      store.error$.subscribe((e) => (error = e));

      store.loadCandidates();
      tick();

      expect(error).toBe('Network error');
    }));
  });

  describe('createCandidate', () => {
    it('adds candidate to state', fakeAsync(() => {
      const newCandidate = { ...mockCandidate, id: '2', name: 'Jane' };
      api.create.mockReturnValue(of(newCandidate));

      let result: Candidate[] = [];
      store.candidates$.subscribe((c) => (result = c));

      store.createCandidate({
        name: 'Jane',
        surname: 'Doe',
        file: new File([''], 'test.xlsx'),
      }).subscribe();
      tick();

      expect(result[0].name).toBe('Jane');
      expect(snackBar.open).toHaveBeenCalled();
    }));
  });

  describe('deleteCandidate', () => {
    it('removes candidate from state', fakeAsync(() => {
      api.getAll.mockReturnValue(of([mockCandidate]));
      api.delete.mockReturnValue(of(undefined));

      store.loadCandidates();
      tick();

      let result: Candidate[] = [];
      store.candidates$.subscribe((c) => (result = c));

      store.deleteCandidate('1');
      tick();

      expect(result).toHaveLength(0);
    }));
  });

  describe('getCandidateById', () => {
    it('returns cached candidate', fakeAsync(() => {
      api.getAll.mockReturnValue(of([mockCandidate]));

      store.loadCandidates();
      tick();

      expect(store.getCandidateById('1')?.name).toBe('John');
    }));

    it('returns undefined for unknown id', () => {
      expect(store.getCandidateById('unknown')).toBeUndefined();
    });
  });
});
