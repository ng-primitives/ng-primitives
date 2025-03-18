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
      border: 1px solid var(--ngp-border);
      border-radius: 0.5rem;
      box-shadow: var(--ngp-shadow);
      outline: none;
    }

    input[data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    p {
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
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
