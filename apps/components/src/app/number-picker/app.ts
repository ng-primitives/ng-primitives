import { Component } from '@angular/core';
import { NumberPicker } from './number-picker';

@Component({
  selector: 'app-number-picker-example',
  imports: [NumberPicker],
  template: `
    <app-number-picker />
  `,
})
export default class App {}
