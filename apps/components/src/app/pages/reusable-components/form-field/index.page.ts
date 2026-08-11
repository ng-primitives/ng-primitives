import { Component } from '@angular/core';
import { Field } from './field';

@Component({
  selector: 'app-form-field-example',
  imports: [Field],
  template: `
    <app-field>
      <!-- Add label and form control here -->
      <label>Username</label>
      <input type="text" placeholder="Enter your username" />
    </app-field>
  `,
})
export default class App {}
