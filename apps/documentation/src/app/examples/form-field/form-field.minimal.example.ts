import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NgpDescription,
  NgpError,
  NgpFormControl,
  NgpFormField,
  NgpLabel,
} from 'ng-primitives/form-field';

@Component({
  selector: 'app-form-field-minimal',
  imports: [NgpFormField, NgpLabel, NgpError, NgpDescription, NgpFormControl, ReactiveFormsModule],
  template: `
    <div [formGroup]="formGroup" ngpFormField>
      <label ngpLabel>Full Name</label>
      <p ngpDescription>Please include any middle names, no matter how ridiculous.</p>
      <input
        ngpFormControl
        type="text"
        placeholder="Enter your full name"
        formControlName="fullName"
      />
      <p ngpError ngpErrorValidator="required">This field is required.</p>
    </div>
  `,
  styles: `
    [ngpError] {
      display: none;
    }

    [ngpError][data-validator='fail'][data-dirty] {
      display: block;
    }
  `,
})
export default class FormFieldExample {
  /** The Angular Form Group */
  readonly formGroup = new FormGroup({
    fullName: new FormControl('', Validators.required),
  });
}
