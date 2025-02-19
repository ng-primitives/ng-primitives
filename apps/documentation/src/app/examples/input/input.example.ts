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
      height: 36px;
      width: 100%;
      border-radius: 8px;
      padding: 0 16px;
      border: none;
      box-shadow: var(--input-shadow);
      outline: none;
    }

    [ngpInput]:focus {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
    }

    [ngpInput]::placeholder {
      color: var(--text-placeholder);
    }
  `,
})
export default class InputExample {}
