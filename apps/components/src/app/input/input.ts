import { Component } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';

@Component({
  selector: 'input[app-input]',
  hostDirectives: [{ directive: NgpInput, inputs: ['disabled'] }],
  template: '',
  styles: `
    :host {
      height: 36px;
      width: 100%;
      border-radius: 8px;
      padding: 0 16px;
      border: none;
      box-shadow: var(--ngp-input-shadow);
      outline: none;
      box-sizing: border-box;
    }

    :host:focus {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    :host::placeholder {
      color: var(--ngp-text-placeholder);
    }
  `,
})
export class Input {}
