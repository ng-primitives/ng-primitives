import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Toggle } from './toggle';

@Component({
  selector: 'app-toggle-example',
  imports: [Toggle, FormsModule],
  template: `
    <button [(ngModel)]="selected" app-toggle>Toggle</button>
  `,
})
export default class App {
  selected = signal(false);
}
