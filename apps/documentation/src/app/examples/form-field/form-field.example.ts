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
      --form-field-label-color: rgb(9 9 11);
      --form-field-description-color: rgb(113 113 122);
      --form-field-error-color: rgb(239 68 68);

      --form-field-label-color-dark: #e4e4e7;
      --form-field-description-color-dark: #96969e;
      --form-field-error-color-dark: #ff4d4d;
    }

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
      border: none;
      box-shadow:
        0 1px 2px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.007)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
      outline: none;
    }

    [ngpFormControl]:focus {
      box-shadow: 0 0 0 2px rgb(59, 130, 246);
    }

    [ngpFormControl]::placeholder {
      color: rgb(161 161 170);
    }

    [ngpLabel] {
      color: light-dark(var(--form-field-label-color), var(--form-field-label-color-dark));
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    [ngpDescription] {
      color: light-dark(
        var(--form-field-description-color),
        var(--form-field-description-color-dark)
      );
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0 0 4px;
    }

    [ngpError] {
      display: none;
      color: light-dark(var(--form-field-error-color), var(--form-field-error-color-dark));
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0;
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
