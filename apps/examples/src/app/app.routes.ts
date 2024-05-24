import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'examples/slider',
    loadComponent: () => import('./examples/slider/slider.example'),
  },
  {
    path: 'examples/select',
    loadComponent: () => import('./examples/select/select.example'),
  },
  {
    path: 'examples/tabs',
    loadComponent: () => import('./examples/tabs/tabs.example'),
  },
  {
    path: 'examples/roving-focus',
    loadComponent: () => import('./examples/roving-focus/roving-focus.example'),
  },
  {
    path: 'examples/resize',
    loadComponent: () => import('./examples/resize/resize.example'),
  },
  {
    path: 'examples/radio',
    loadComponent: () => import('./examples/radio/radio.example'),
  },
  {
    path: 'examples/toggle',
    loadComponent: () => import('./examples/toggle/toggle.example'),
  },
  {
    path: 'examples/avatar',
    loadComponent: () => import('./examples/avatar/avatar.example'),
  },
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
    path: 'examples/tooltip',
    loadComponent: () => import('./examples/tooltip/tooltip.example'),
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
