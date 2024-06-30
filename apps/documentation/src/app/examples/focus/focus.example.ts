import { Component, signal } from '@angular/core';
import { NgpFocus } from 'ng-primitives/interactions';

@Component({
  standalone: true,
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

    [ngpFocus] {
      height: 36px;
      padding: 0 12px;
      border-radius: 0.5rem;
      box-shadow:
        0 1px 2px 0 rgba(0, 0, 0, 0.05),
        0 0 0 1px rgba(0, 0, 0, 0.1);
      outline: none;
    }

    [ngpFocus][data-focused='true'] {
      box-shadow:
        0 1px 2px 0 rgba(0, 0, 0, 0.05),
        0 0 0 2px rgb(59 130 246);
    }

    p {
      font-size: 0.75rem;
      color: #666;
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
