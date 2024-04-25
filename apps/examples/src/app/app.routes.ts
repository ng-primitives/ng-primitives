import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'examples/accordion',
    loadComponent: () => import('./examples/accordion/accordion.example'),
  },
  {
    path: 'examples/switch',
    loadComponent: () => import('./examples/switch/switch.example'),
  },
  {
    path: 'examples/progress',
    loadComponent: () => import('./examples/progress/progress.example'),
  },
  {
    path: 'examples/checkbox',
    loadComponent: () => import('./examples/checkbox/checkbox.example'),
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page'),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/home',
  },
];
