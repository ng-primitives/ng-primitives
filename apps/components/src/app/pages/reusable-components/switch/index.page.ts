import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Switch } from './switch';

@Component({
  selector: 'app-switch-example',
  imports: [Switch, FormsModule],
  template: `
    <app-switch [(ngModel)]="checked" aria-label="Toggle Switch" />
  `,
})
export default class App {
  checked = signal(true);
}
