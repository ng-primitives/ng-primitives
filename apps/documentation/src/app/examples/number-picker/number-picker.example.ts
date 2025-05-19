import { Component } from '@angular/core';
import {
  NgpNumberPicker,
  NgpNumberPickerDecrement,
  NgpNumberPickerIncrement,
  NgpNumberPickerInput,
} from 'ng-primitives/number-picker';

@Component({
  selector: 'app-number-picker',
  imports: [
    NgpNumberPicker,
    NgpNumberPickerInput,
    NgpNumberPickerDecrement,
    NgpNumberPickerIncrement,
  ],
  template: `
    <div ngpNumberPicker>
      <button ngpNumberPickerDecrement>Decrement</button>
      <input ngpNumberPickerInput />
      <button ngpNumberPickerIncrement>Increment</button>
    </div>
  `,
})
export default class NumberPickerExample {}
