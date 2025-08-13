import { Component } from '@angular/core';
import { NativeSelect } from './native-select';

@Component({
  selector: 'app-select-example',
  imports: [NativeSelect],
  template: `
    <select app-select>
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
    </select>
  `,
})
export default class App {}
