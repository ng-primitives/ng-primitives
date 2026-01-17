import { Component, signal } from '@angular/core';
import { NgpFocusable } from 'ng-primitives/focusable';

@Component({
  selector: '[app-button]',
  hostDirectives: [
    {
      directive: NgpFocusable,
      inputs: ['ngpFocusableDisabled:disabled', 'ngpFocusableWhenDisabled:focusableWhenDisabled'],
    },
  ],
  template: '<ng-content />',
  styles: `
    :host {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      border: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      gap: 0.5rem;
    }
    :host:disabled {
      pointer-events: none;
    }
    :host[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }
    :host[data-hover]:not([data-disabled]) {
      background-color: var(--ngp-background-hover);
    }
    :host[data-press]:not([data-disabled]) {
      background-color: var(--ngp-background-active);
    }
    :host[data-disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `,
})
export class CustomButton {}

@Component({
  selector: 'app-focusable-example',
  imports: [CustomButton],
  template: `
    <div class="example-container">
      <button
        [disabled]="isDisabled()"
        [focusableWhenDisabled]="isFocusableWhenDisabled()"
        (click)="!isDisabled() && handleClick()"
        app-button
      >
        @if (isDisabled() && !isFocusableWhenDisabled()) {
          Fully Disabled
        } @else if (isDisabled() && isFocusableWhenDisabled()) {
          Disabled but Focusable
        } @else {
          Interactive
        }
      </button>

      <label class="toggle-label">
        <input [checked]="isDisabled()" (change)="toggleDisabled()" type="checkbox" />
        Disabled
      </label>

      <label class="toggle-label">
        <input
          [checked]="isFocusableWhenDisabled()"
          (change)="toggleFocusableWhenDisabled()"
          type="checkbox"
        />
        Focusable When Disabled
      </label>

      <p class="click-count">Clicks: {{ clickCount() }}</p>
    </div>
  `,
  styles: `
    .example-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    button {
      align-self: center;
    }

    .toggle-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .click-count {
      color: var(--ngp-text-secondary);
      margin: 0;
    }
  `,
})
export default class FocusableExample {
  readonly isDisabled = signal(false);
  readonly isFocusableWhenDisabled = signal(false);
  readonly clickCount = signal(0);

  toggleDisabled(): void {
    this.isDisabled.update(v => !v);
  }

  toggleFocusableWhenDisabled(): void {
    this.isFocusableWhenDisabled.update(v => !v);
  }

  handleClick(): void {
    this.clickCount.update(v => v + 1);
  }
}
