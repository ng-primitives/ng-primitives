import { Component } from '@angular/core';
import { NgpFocusVisible } from 'ng-primitives/interactions';

@Component({
  standalone: true,
  selector: 'app-focus-visible',
  imports: [NgpFocusVisible],
  template: `
    <button ngpFocusVisible>Try focusing me!</button>
  `,
  styles: `
    button {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: rgb(10 10 10);
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: #fff;
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    button[data-focus-visible='true'] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px #f5f5f5,
        0 0 0 4px rgb(59 130 246);
    }
  `,
})
export default class FocusVisibleExample {}
