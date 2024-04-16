import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'progress/progress',
    loadComponent: () => import('./examples/progress/progress.example'),
  },
  {
    path: 'checkbox/checkbox',
    loadComponent: () => import('./examples/checkbox/checkbox.example'),
  },
];
