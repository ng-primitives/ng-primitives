import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpToggle } from 'ng-primitives/toggle';

@Component({
  standalone: true,
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
      color: rgb(10 10 10);
      border: none;
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

    [ngpButton][data-hover='true'] {
      background-color: rgb(250 250 250);
    }

    [ngpButton][data-focus-visible='true'] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px #f5f5f5,
        0 0 0 4px rgb(59 130 246);
    }

    [ngpButton][data-press='true'] {
      background-color: rgb(245 245 245);
    }

    [ngpButton][data-selected='true'] {
      background-color: rgb(10 10 10);
      color: white;
    }
  `,
})
export default class ToggleExample {
  /**
   * Whether the toggle is selected.
   */
  readonly selected = signal(false);
}
