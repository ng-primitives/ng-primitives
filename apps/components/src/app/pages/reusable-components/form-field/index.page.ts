import { Component } from '@angular/core';
import { Field } from './form-field';

@Component({
  selector: 'app-form-field-example',
  imports: [Field],
  template: `
    <app-form-field>
      <!-- Add label and form control here -->
      <label>Username</label>
      <input type="text" placeholder="Enter your username" />
    </app-form-field>
  `,
})
export default class App {}
