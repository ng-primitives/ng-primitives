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
      border-radius: 8px;
      padding: 8px 12px;
      border: none;
      box-shadow: var(--ngp-input-shadow);
      background-color: var(--ngp-background);
      outline: none;
    }

    [ngpTextarea][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 0px;
    }

    [ngpTextarea]::placeholder {
      color: var(--ngp-text-placeholder);
    }
  `,
})
export default class TextareaExample {}
