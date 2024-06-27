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
  standalone: true,
  selector: 'app-form-field',
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
    :host {
      display: contents;
    }

    [ngpFormField] {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 90%;
    }

    [ngpFormControl] {
      height: 36px;
      width: 100%;
      border-radius: 8px;
      padding: 0 16px;
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.05),
        0 0 0 1px rgba(0, 0, 0, 0.1);
      outline: none;
    }

    [ngpFormControl]:focus {
      box-shadow: 0 0 0 2px rgb(59, 130, 246);
    }

    [ngpFormControl]:placeholder {
      color: rgb(161 161 170);
    }

    [ngpLabel] {
      color: rgb(9 9 11);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    [ngpDescription] {
      color: rgb(113 113 122);
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0 0 4px;
    }

    [ngpError] {
      display: none;
      color: rgb(239 68 68);
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0;
    }

    [ngpError][data-validator='fail'][data-dirty='true'] {
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
