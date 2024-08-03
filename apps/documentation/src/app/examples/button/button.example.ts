import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  standalone: true,
  selector: 'app-button',
  imports: [NgpButton],
  template: `
    <button ngpButton>Button</button>
  `,
  styles: `
    :host {
      --button-color: rgb(10 10 10);
      --button-background-color: rgb(255 255 255);
      --button-hover-color: rgb(10 10 10);
      --button-hover-background-color: rgb(250 250 250);
      --button-focus-shadow: 0 0 0 2px rgb(59 130 246);
      --button-pressed-background-color: rgb(245 245 245);

      --button-color-dark: rgb(255 255 255);
      --button-background-color-dark: rgb(43 43 43);
      --button-hover-color-dark: rgb(255 255 255);
      --button-hover-background-color-dark: rgb(63, 63, 70);
      --button-focus-shadow-dark: 0 0 0 2px rgb(59 130 246);
      --button-pressed-background-color-dark: rgb(39, 39, 42);
    }

    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: light-dark(var(--button-color), var(--button-color-dark));
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: light-dark(
        var(--button-background-color),
        var(--button-background-color-dark)
      );
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    [ngpButton][data-hover='true'] {
      background-color: light-dark(
        var(--button-hover-background-color),
        var(--button-hover-background-color-dark)
      );
    }

    [ngpButton][data-focus-visible='true'] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px light-dark(#f5f5f5, #3f3f46),
        0 0 0 4px rgb(59 130 246);
    }

    [ngpButton][data-press='true'] {
      background-color: light-dark(
        var(--button-pressed-background-color),
        var(--button-pressed-background-color-dark)
      );
    }
  `,
})
export default class ButtonExample {}
