import { Component } from '@angular/core';
import { Breadcrumbs } from './breadcrumbs';

@Component({
  selector: 'app-breadcrumbs-example',
  imports: [Breadcrumbs],
  template: `
    <app-breadcrumbs></app-breadcrumbs>
  `,
})
export default class App {}
