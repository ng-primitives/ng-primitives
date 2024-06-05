import { Component } from '@angular/core';
import { AnalogWelcomeComponent } from './analog-welcome.component';

@Component({
  selector: 'documentation-home',
  standalone: true,
  imports: [AnalogWelcomeComponent],
  template: `
    <documentation-analog-welcome />
  `,
})
export default class HomeComponent {}
