import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'accordion',
    loadComponent: () => import('./accordion/app'),
  },
  {
    path: 'button',
    loadComponent: () => import('./button/app'),
  },
  {
    path: 'input',
    loadComponent: () => import('./input/app'),
  },
];
