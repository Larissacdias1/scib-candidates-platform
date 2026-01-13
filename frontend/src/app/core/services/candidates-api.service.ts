import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "@env/environment";
import { Candidate, CreateCandidatePayload } from "../models/candidate.model";

@Injectable({ providedIn: "root" })
export class CandidatesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/candidates`;

  getAll(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(this.baseUrl).pipe(
      map((list) => list.map((c) => this.parseCandidate(c))),
      catchError(this.handleError)
    );
  }

  getById(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.baseUrl}/${id}`).pipe(
      map((c) => this.parseCandidate(c)),
      catchError(this.handleError)
    );
  }

  create(payload: CreateCandidatePayload): Observable<Candidate> {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("surname", payload.surname);
    formData.append("file", payload.file);

    return this.http.post<Candidate>(this.baseUrl, formData).pipe(
      map((c) => this.parseCandidate(c)),
      catchError(this.handleError)
    );
  }

  delete(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private parseCandidate(candidate: Candidate): Candidate {
    return {
      ...candidate,
      createdAt: new Date(candidate.createdAt),
      updatedAt: new Date(candidate.updatedAt),
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = "An unexpected error occurred";

    if (error.error?.message) {
      message = Array.isArray(error.error.message)
        ? error.error.message.join(", ")
        : error.error.message;
    }

    return throwError(() => new Error(message));
  }
}
