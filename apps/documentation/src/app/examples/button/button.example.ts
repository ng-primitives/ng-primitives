import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button',
  imports: [NgpButton],
  template: `
    <button ngpButton>Button</button>
  `,
  styles: `
    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--text-primary);
      border: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--button-shadow);
    }

    [ngpButton][data-hover] {
      background-color: var(--background-hover);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--focus-ring);
    }

    [ngpButton][data-press] {
      background-color: var(--background-active);
    }
  `,
})
export default class ButtonExample {}
