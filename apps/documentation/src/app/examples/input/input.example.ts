import { Component } from '@angular/core';
import { NgpInput } from 'ng-primitives/input';

@Component({
  standalone: true,
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
      width: 90%;
      border-radius: 8px;
      padding: 0 16px;
      border: none;
      box-shadow:
        0 1px 2px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.007)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
      outline: none;
    }

    [ngpInput][data-focus='true'] {
      box-shadow: 0 0 0 2px rgb(59, 130, 246);
    }

    [ngpInput]::placeholder {
      color: rgb(161 161 170);
    }
  `,
})
export default class InputExample {}
