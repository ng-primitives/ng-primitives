import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpInput } from 'ng-primitives/input';

@Component({
  standalone: true,
  selector: 'app-input-form-field',
  imports: [NgpInput, NgpLabel, NgpDescription, NgpFormField],
  template: `
    <div ngpFormField>
      <label ngpLabel>Email address</label>
      <p ngpDescription>We'll never share your email with anyone else, unless they pay us.</p>
      <input ngpInput type="email" placeholder="Enter your email address" />
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

    [ngpInput] {
      height: 36px;
      width: 100%;
      border-radius: 8px;
      padding: 0 16px;
      border: none;
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.05),
        0 0 0 1px rgba(0, 0, 0, 0.1);
      outline: none;
    }

    [ngpInput]:focus {
      box-shadow: 0 0 0 2px rgb(59, 130, 246);
    }

    [ngpInput]::placeholder {
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
  `,
})
export default class InputFormFieldExample {}
