import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'candidates',
    pathMatch: 'full',
  },
  {
    path: 'candidates',
    loadComponent: () =>
      import('./features/candidates/candidates-list/candidates-list.component').then(
        (m) => m.CandidatesListComponent
      ),
  },
  {
    path: 'candidates/new',
    loadComponent: () =>
      import('./features/candidates/candidate-form/candidate-form.component').then(
        (m) => m.CandidateFormComponent
      ),
  },
  {
    path: 'candidates/:id',
    loadComponent: () =>
      import('./features/candidates/candidate-detail/candidate-detail.component').then(
        (m) => m.CandidateDetailComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'candidates',
  },
];
