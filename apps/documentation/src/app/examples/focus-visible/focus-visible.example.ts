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
    :host {
      --focus-visible-button-color: rgb(10 10 10);
      --focus-visible-button-background-color: rgb(255 255 255);
      --focus-visible-button-background-color-hover: rgb(250 250 250);
      --focus-visible-button-pressed-background-color: rgb(245 245 245);

      --focus-visible-button-color-dark: rgb(255 255 255);
      --focus-visible-button-background-color-dark: rgb(43 43 47);
      --focus-visible-button-background-color-hover-dark: rgb(63 63 70);
      --focus-visible-button-pressed-background-color-dark: rgb(39 39 42);
    }

    button {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: light-dark(var(--focus-visible-button-color), var(--focus-visible-button-color-dark));
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: light-dark(
        var(--focus-visible-button-background-color),
        var(--focus-visible-button-background-color-dark)
      );
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
        0 0 0 2px
          light-dark(
            var(--focus-visible-button-background-color),
            var(--focus-visible-button-background-color-dark)
          ),
        0 0 0 4px rgb(59 130 246);
    }
  `,
})
export default class FocusVisibleExample {}
