import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'accordion',
    loadComponent: () => import('./accordion/app.ng'),
  },
  {
    path: 'button',
    loadComponent: () => import('./button/app.ng'),
  },
  {
    path: 'input',
    loadComponent: () => import('./input/app.ng'),
  },
];
