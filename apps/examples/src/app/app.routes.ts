import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'accordion/accordion',
    loadComponent: () => import('./examples/accordion/accordion.example'),
  },
  {
    path: 'switch/switch',
    loadComponent: () => import('./examples/switch/switch.example'),
  },
  {
    path: 'progress/progress',
    loadComponent: () => import('./examples/progress/progress.example'),
  },
  {
    path: 'checkbox/checkbox',
    loadComponent: () => import('./examples/checkbox/checkbox.example'),
  },
];
