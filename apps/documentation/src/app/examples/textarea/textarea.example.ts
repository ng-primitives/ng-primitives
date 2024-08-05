import { Component } from '@angular/core';
import { NgpTextarea } from 'ng-primitives/textarea';

@Component({
  standalone: true,
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
      box-shadow:
        0 1px 2px light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
      outline: none;
    }

    [ngpTextarea][data-focus='true'] {
      box-shadow: 0 0 0 2px rgb(59, 130, 246);
    }

    [ngpTextarea]::placeholder {
      color: rgb(161 161 170);
    }
  `,
})
export default class TextareaExample {}
