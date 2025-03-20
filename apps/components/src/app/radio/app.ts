import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioGroup } from './radio-group';
import { RadioItem } from './radio-item';

@Component({
  selector: 'app-radio-example',
  imports: [RadioGroup, RadioItem, FormsModule],
  template: `
    <app-radio-group [(ngModel)]="value" orientation="vertical">
      <app-radio-item value="1">One</app-radio-item>
      <app-radio-item value="2">Two</app-radio-item>
      <app-radio-item value="3">Three</app-radio-item>
    </app-radio-group>
  `,
})
export default class App {
  value = signal('1');
}
