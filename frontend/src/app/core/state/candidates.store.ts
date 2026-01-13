import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, catchError, finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Candidate, CreateCandidatePayload } from '../models/candidate.model';
import { CandidatesApiService } from '../services/candidates-api.service';

interface State {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

@Injectable({ providedIn: 'root' })
export class CandidatesStore {
  private readonly api = inject(CandidatesApiService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly state = new BehaviorSubject<State>({
    candidates: [],
    loading: false,
    error: null,
    initialized: false,
  });

  readonly candidates$ = this.state.pipe(map((s) => s.candidates));
  readonly loading$ = this.state.pipe(map((s) => s.loading));
  readonly error$ = this.state.pipe(map((s) => s.error));

  loadCandidates(): void {
    if (this.state.getValue().initialized) return;

    this.patch({ loading: true, error: null });

    this.api.getAll().pipe(
      tap((candidates) => this.patch({ candidates, initialized: true })),
      catchError((err) => {
        this.patch({ error: err.message });
        return [];
      }),
      finalize(() => this.patch({ loading: false }))
    ).subscribe();
  }

  createCandidate(payload: CreateCandidatePayload): Observable<Candidate> {
    return this.api.create(payload).pipe(
      tap((candidate) => {
        const current = this.state.getValue().candidates;
        this.patch({ candidates: [candidate, ...current] });
        this.notify('Candidate registered successfully');
      }),
      catchError((err) => {
        this.notify(err.message, true);
        throw err;
      })
    );
  }

  deleteCandidate(id: string): void {
    this.api.delete(id).pipe(
      tap(() => {
        const filtered = this.state.getValue().candidates.filter((c) => c.id !== id);
        this.patch({ candidates: filtered });
        this.notify('Candidate removed successfully');
      }),
      catchError((err) => {
        this.notify(err.message, true);
        return [];
      })
    ).subscribe();
  }

  getCandidateById(id: string): Candidate | undefined {
    return this.state.getValue().candidates.find((c) => c.id === id);
  }

  private patch(partial: Partial<State>): void {
    this.state.next({ ...this.state.getValue(), ...partial });
  }

  private notify(message: string, isError = false): void {
    this.snackBar.open(message, 'Close', {
      duration: isError ? 5000 : 3000,
      panelClass: isError ? 'error-snackbar' : 'success-snackbar',
    });
  }
}
