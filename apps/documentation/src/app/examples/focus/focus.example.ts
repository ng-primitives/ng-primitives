import { Component, signal } from '@angular/core';
import { NgpFocus } from 'ng-primitives/interactions';

@Component({
  selector: 'app-focus',
  imports: [NgpFocus],
  template: `
    <input (ngpFocus)="isFocused.set($event)" placeholder="Try focusing me!" />
    <p>Input is {{ isFocused() ? 'focused' : 'blurred' }}.</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
    }

    input {
      height: 36px;
      padding: 0 12px;
      border-radius: 0.5rem;
      box-shadow:
        0 1px 2px 0 light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.007)),
        0 0 0 1px light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1));
      outline: none;
    }

    input[data-focus] {
      box-shadow:
        0 1px 2px 0 light-dark(rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.007)),
        0 0 0 2px rgb(59 130 246);
    }

    p {
      font-size: 0.75rem;
      color: light-dark(#666, #7e7e7e);
      margin-top: 0.25rem;
    }
  `,
})
export default class FocusExample {
  /**
   * Whether the input is currently focused.
   */
  readonly isFocused = signal<boolean>(false);
}
