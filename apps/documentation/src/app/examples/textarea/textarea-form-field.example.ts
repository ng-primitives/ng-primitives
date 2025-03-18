import { Component } from '@angular/core';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpTextarea } from 'ng-primitives/textarea';

@Component({
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
      box-shadow: var(--ngp-input-shadow);
      outline: none;
    }

    [ngpTextarea][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 0px;
    }

    [ngpTextarea]::placeholder {
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
export default class TextareaFormFieldExample {}
