import { Component } from '@angular/core';
import { NgpFocusVisible } from 'ng-primitives/interactions';

@Component({
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
      color: var(--ngp-text-primary);
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-shadow);
    }

    button[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }
  `,
})
export default class FocusVisibleExample {}
