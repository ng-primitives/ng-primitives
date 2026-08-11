import { Component } from '@angular/core';
import { Rating } from './rating';

@Component({
  selector: 'app-rating-example',
  imports: [Rating],
  template: `
    <app-rating [count]="5" [value]="3" aria-label="Rating" />
  `,
})
export default class App {}
