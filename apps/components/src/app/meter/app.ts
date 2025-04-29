import { Component } from '@angular/core';
import { Meter } from './meter';

@Component({
  selector: 'app-meter-example',
  imports: [Meter],
  template: `
    <app-meter label="Label" value="40" />
  `,
})
export default class App {}
