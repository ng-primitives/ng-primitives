import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpTextarea } from 'ng-primitives/textarea';

@Component({
  standalone: true,
  selector: 'app-textarea-form-field',
  imports: [NgpTextarea, NgpLabel, NgpDescription, NgpFormField],
  template: `
    <div ngpFormField>
      <label ngpLabel>Message</label>
      <p ngpDescription>Tell us about your favorite sandwich.</p>
      <textarea ngpTextarea placeholder="Enter your message"></textarea>
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

    [ngpTextarea] {
      height: 72px;
      width: 90%;
      border-radius: 8px;
      padding: 8px 12px;
      border: none;
      box-shadow:
        0 1px 2px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
      outline: none;
    }

    [ngpTextarea]:focus {
      box-shadow: 0 0 0 2px rgb(59, 130, 246);
    }

    [ngpTextarea]::placeholder {
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
export default class TextareaFormFieldExample {}
