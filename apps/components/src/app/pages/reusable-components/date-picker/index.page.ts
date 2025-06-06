import { Component } from '@angular/core';
import { DatePicker } from './date-picker';

@Component({
  selector: 'app-date-picker-example',
  imports: [DatePicker],
  template: `
    <app-date-picker />
  `,
})
export default class App {}
