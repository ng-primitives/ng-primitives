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
    :host {
      --toggle-background-color: rgb(255 255 255);
      --toggle-color: rgb(10 10 10);
      --toggle-hover-background-color: rgb(250 250 250);
      --toggle-pressed-background-color: rgb(245 245 245);
      --toggle-selected-background-color: rgb(10 10 10);
      --toggle-selected-color: rgb(255 255 255);

      --toggle-background-color-dark: rgb(43 43 47);
      --toggle-color-dark: rgb(255 255 255);
      --toggle-hover-background-color-dark: rgb(63 63 70);
      --toggle-pressed-background-color-dark: rgb(39 39 42);
      --toggle-selected-background-color-dark: rgb(59 130 246);
      --toggle-selected-color-dark: rgb(255 255 255);
    }

    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: light-dark(var(--toggle-color), var(--toggle-color-dark));
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: light-dark(
        var(--toggle-background-color),
        var(--toggle-background-color-dark)
      );
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    [ngpButton][data-hover] {
      background-color: light-dark(
        var(--toggle-hover-background-color),
        var(--toggle-hover-background-color-dark)
      );
    }

    [ngpButton][data-focus-visible] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px light-dark(#f5f5f5, #3f3f46),
        0 0 0 4px rgb(59 130 246);
    }

    [ngpButton][data-press] {
      background-color: light-dark(
        var(--toggle-pressed-background-color),
        var(--toggle-pressed-background-color-dark)
      );
    }

    [ngpButton][data-selected] {
      background-color: light-dark(
        var(--toggle-selected-background-color),
        var(--toggle-selected-background-color-dark)
      );
      color: light-dark(var(--toggle-selected-color), var(--toggle-selected-color-dark));
    }
  `,
})
export default class ToggleExample {
  /**
   * Whether the toggle is selected.
   */
  readonly selected = signal(false);
}
