import { Component } from '@angular/core';
import { Listbox } from './listbox';
import { ListboxOption } from './listbox-option';

@Component({
  selector: 'app-listbox-example',
  imports: [Listbox, ListboxOption],
  template: `
    <app-listbox>
      <app-listbox-option value="One">One</app-listbox-option>
      <app-listbox-option value="Two">Two</app-listbox-option>
      <app-listbox-option value="Three">Three</app-listbox-option>
    </app-listbox>
  `,
})
export default class App {}
