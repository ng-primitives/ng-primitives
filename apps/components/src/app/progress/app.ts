import { Component } from '@angular/core';
import { Progress } from './progress';

@Component({
  selector: 'app-progress-example',
  imports: [Progress],
  template: `
    <app-progress value="50" aria-label="Progress indicator" />
  `,
})
export default class App {}
