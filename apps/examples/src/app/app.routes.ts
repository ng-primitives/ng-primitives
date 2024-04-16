import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'checkbox/checkbox',
    loadChildren: () => import('./examples/checkbox/checkbox.example'),
  },
];
