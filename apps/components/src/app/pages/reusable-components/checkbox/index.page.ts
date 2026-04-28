import { Component, model } from '@angular/core';
import { Checkbox } from './checkbox';

@Component({
  selector: 'app-checkbox-example',
  imports: [Checkbox],
  template: `
    <app-checkbox [(checked)]="checked" aria-label="Checkbox example" />
  `,
})
export default class App {
  checked = model<boolean>(false);
}
