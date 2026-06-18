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
      display: contents;
    }

    [ngpFormField] {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 300px;
    }

    [ngpFormControl] {
      height: 2.125rem;
      width: 100%;
      border-radius: 0.5rem;
      padding: 0 16px;
      border: none;
      box-shadow: var(--ngp-input-shadow);
      background-color: var(--ngp-background);
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      outline: none;
    }

    [ngpFormControl]:focus {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpFormControl]::placeholder {
      color: var(--ngp-text-placeholder);
    }

    [ngpLabel] {
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 510;
      margin: 0;
    }

    [ngpDescription] {
      color: var(--ngp-text-secondary);
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0 0 4px;
    }

    [ngpError] {
      display: none;
      color: var(--ngp-primary);
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
