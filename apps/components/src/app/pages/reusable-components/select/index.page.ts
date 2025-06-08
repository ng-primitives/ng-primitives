import { Component } from '@angular/core';
import { Select } from './select';

@Component({
  selector: 'app-select-example',
  imports: [Select],
  template: `
    <select app-select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    </select>
  `,
})
export default class App {}
