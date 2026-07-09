import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Password } from './password';

@Component({
  selector: 'app-password-example',
  imports: [Password, FormsModule],
  template: `
    <app-password [(ngModel)]="value" placeholder="Enter your password" />
  `,
})
export default class App {
  readonly value = signal<string>('');
}
