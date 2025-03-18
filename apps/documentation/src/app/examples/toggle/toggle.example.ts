import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpToggle } from 'ng-primitives/toggle';

@Component({
  selector: 'app-toggle',
  imports: [NgpToggle, NgpButton],
  template: `
    <button [(ngpToggleSelected)]="selected" ngpButton ngpToggle>Toggle</button>
  `,
  styles: `
    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
    }

    [ngpButton][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpButton][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpButton][data-selected] {
      background-color: var(--ngp-background-inverse);
      color: var(--ngp-text-inverse);
    }
  `,
})
export default class ToggleExample {
  /**
   * Whether the toggle is selected.
   */
  readonly selected = signal(false);
}
