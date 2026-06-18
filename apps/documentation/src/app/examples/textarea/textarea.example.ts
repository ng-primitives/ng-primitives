import { Component } from '@angular/core';
import { NgpTextarea } from 'ng-primitives/textarea';

@Component({
  selector: 'app-textarea',
  imports: [NgpTextarea],
  template: `
    <textarea ngpTextarea placeholder="Enter your message"></textarea>
  `,
  styles: `
    :host {
      display: contents;
    }

    [ngpTextarea] {
      height: 72px;
      width: 90%;
      border-radius: 0.625rem;
      padding: 10px 14px;
      border: none;
      box-shadow: var(--ngp-input-shadow);
      background-color: var(--ngp-background);
      color: var(--ngp-text-primary);
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      outline: none;
    }

    [ngpTextarea][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpTextarea]::placeholder {
      color: var(--ngp-text-placeholder);
    }
  `,
})
export default class TextareaExample {}
