import { Component } from '@angular/core';
import { NgpTextarea } from 'ng-primitives/textarea';

@Component({
  selector: 'textarea[app-textarea]',
  hostDirectives: [{ directive: NgpTextarea, inputs: ['disabled'] }],
  template: `
    <ng-content />
  `,
  styles: `
    :host {
      height: 72px;
      width: 90%;
      border-radius: 8px;
      padding: 8px 12px;
      border: none;
      box-shadow: var(--ngp-input-shadow);
      outline: none;
      font-family: inherit;
    }

    :host[data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 0;
    }

    :host::placeholder {
      color: var(--ngp-text-placeholder);
    }
  `,
})
export class Textarea {}
