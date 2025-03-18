import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpInput } from 'ng-primitives/input';

@Component({
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
      box-shadow: var(--ngp-input-shadow);
      outline: none;
    }

    [ngpInput]:focus {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpInput]::placeholder {
      color: var(--ngp-text-placeholder);
    }

    [ngpLabel] {
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    [ngpDescription] {
      color: var(--ngp-text-secondary);
      font-size: 0.75rem;
      line-height: 1rem;
      margin: 0 0 4px;
    }
  `,
})
export default class InputFormFieldExample {}
