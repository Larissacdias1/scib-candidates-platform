import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CandidatesStore } from '@app/core/state/candidates.store';
import { finalize } from 'rxjs/operators';

const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './candidate-form.component.html',
  styleUrls: ['./candidate-form.component.scss'],
})
export class CandidateFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(CandidatesStore);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    surname: ['', [Validators.required, Validators.maxLength(100)]],
  });

  selectedFile: File | null = null;
  fileError: string | null = null;
  isDragOver = false;
  submitting = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files?.length) {
      this.validateAndSetFile(files[0]);
    }
  }

  onClearFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.fileError = null;
  }

  onSubmit(): void {
    if (this.form.invalid || !this.selectedFile) {
      return;
    }

    this.submitting = true;

    this.store
      .createCandidate({
        name: this.form.value.name!,
        surname: this.form.value.surname!,
        file: this.selectedFile,
      })
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => this.router.navigate(['/candidates']),
        error: () => {}, // Error handled by store
      });
  }

  onCancel(): void {
    this.router.navigate(['/candidates']);
  }

  private validateAndSetFile(file: File): void {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      this.fileError = 'Only Excel files (.xlsx, .xls) are allowed';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      this.fileError = 'File must be at most 5MB';
      return;
    }

    this.selectedFile = file;
    this.fileError = null;
  }
}
