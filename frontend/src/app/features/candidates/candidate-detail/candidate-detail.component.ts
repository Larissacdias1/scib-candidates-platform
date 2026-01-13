import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CandidatesStore } from '@app/core/state/candidates.store';
import { CandidatesApiService } from '@app/core/services/candidates-api.service';
import { Candidate } from '@app/core/models/candidate.model';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './candidate-detail.component.html',
  styleUrls: ['./candidate-detail.component.scss'],
})
export class CandidateDetailComponent implements OnInit {
  @Input() id!: string;

  private readonly store = inject(CandidatesStore);
  private readonly api = inject(CandidatesApiService);
  private readonly router = inject(Router);

  candidate: Candidate | null = null;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.loadCandidate();
  }

  onGoBack(): void {
    this.router.navigate(['/candidates']);
  }

  private loadCandidate(): void {
    const cached = this.store.getCandidateById(this.id);

    if (cached) {
      this.candidate = cached;
      return;
    }

    this.loading = true;
    this.api.getById(this.id).subscribe({
      next: (candidate) => {
        this.candidate = candidate;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      },
    });
  }
}
