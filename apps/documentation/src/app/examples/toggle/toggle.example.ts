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
      padding-inline: 0.875rem;
      border-radius: 0.625rem;
      color: var(--ngp-text-primary);
      border: none;
      outline: none;
      height: 2.125rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      background-color: var(--ngp-background);
      transition:
        background-color 200ms cubic-bezier(0.4, 0, 0.2, 1),
        color 200ms cubic-bezier(0.4, 0, 0.2, 1);
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
      background-color: var(--ngp-primary);
      color: var(--ngp-primary-text);
    }

    [ngpButton][data-selected][data-hover] {
      background-color: var(--ngp-primary-hover);
    }
  `,
})
export default class ToggleExample {
  /**
   * Whether the toggle is selected.
   */
  readonly selected = signal(false);
}
