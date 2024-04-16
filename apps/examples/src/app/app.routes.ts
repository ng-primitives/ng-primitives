import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'checkbox/checkbox',
    loadComponent: () => import('./examples/checkbox/checkbox.example'),
  },
];
