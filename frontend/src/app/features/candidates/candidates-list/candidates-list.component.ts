import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatChipsModule } from "@angular/material/chips";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { CandidatesStore } from "@app/core/state/candidates.store";

@Component({
  selector: "app-candidates-list",
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  templateUrl: "./candidates-list.component.html",
  styleUrls: ["./candidates-list.component.scss"],
})
export class CandidatesListComponent implements OnInit {
  private readonly store = inject(CandidatesStore);
  private readonly router = inject(Router);

  readonly candidates$ = this.store.candidates$;
  readonly loading$ = this.store.loading$;
  readonly error$ = this.store.error$;

  readonly displayedColumns = [
    "name",
    "surname",
    "seniority",
    "yearsOfExperience",
    "availability",
    "actions",
  ];

  ngOnInit(): void {
    this.store.loadCandidates();
  }

  onNewCandidate(): void {
    this.router.navigate(["/candidates/new"]);
  }

  onViewDetails(id: string): void {
    this.router.navigate(["/candidates", id]);
  }

  onDelete(id: string): void {
    this.store.deleteCandidate(id);
  }

  onRetry(): void {
    this.store.loadCandidates();
  }
}
