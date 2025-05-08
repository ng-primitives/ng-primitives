import { Component } from '@angular/core';
import { Combobox } from './combobox';

@Component({
  selector: 'app-combobox-example',
  imports: [Combobox],
  template: `
    <app-combobox />
  `,
})
export default class App {}
