import { Component } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';

@Component({
  selector: 'app-input',
  imports: [NgpInput],
  template: `
    <input ngpInput type="text" placeholder="Enter your full name" />
  `,
  styles: `
    :host {
      display: contents;
    }

    [ngpInput] {
      height: 2.125rem;
      width: 300px;
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

    [ngpInput]:focus {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpInput]::placeholder {
      color: var(--ngp-text-placeholder);
    }
  `,
})
export default class InputExample {}
