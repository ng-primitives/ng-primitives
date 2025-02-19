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
      box-shadow: var(--input-shadow);
      outline: none;
    }

    [ngpTextarea][data-focus] {
      outline: 2px solid var(--focus-ring);
      outline-offset: 0px;
    }

    [ngpTextarea]::placeholder {
      color: var(--text-placeholder);
    }
  `,
})
export default class TextareaExample {}
