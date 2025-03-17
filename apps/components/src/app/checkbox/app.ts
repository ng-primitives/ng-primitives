import { Component } from '@angular/core';
import { Checkbox } from './checkbox';

@Component({
  selector: 'app-checkbox-example',
  imports: [Checkbox],
  template: `
    <app-checkbox />
  `,
})
export default class App {}
