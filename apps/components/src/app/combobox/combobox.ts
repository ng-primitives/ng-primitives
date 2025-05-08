import { Component } from '@angular/core';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';

@Component({
  selector: 'app-combobox',
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxOption,
    NgpComboboxInput,
    NgpComboboxPortal,
    NgpComboboxButton,
  ],
  template: `
    <div ngpCombobox>
      <input ngpComboboxInput />
      <button ngpComboboxButton>Toggle</button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        @for (option of options; track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
  styles: ``,
})
export class Combobox {
  readonly options: string[] = ['Option 1', 'Option 2', 'Option 3'];
}
