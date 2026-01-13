import { Component, signal } from '@angular/core';
import { NgpActionable } from 'ng-primitives/actionable';

@Component({
  selector: 'app-actionable-example',
  imports: [NgpActionable],
  template: `
    <div class="example-container">
      <div
        class="custom-button"
        [ngpActionableDisabled]="isDisabled()"
        [ngpActionableFocusableWhenDisabled]="isFocusableWhenDisabled()"
        (click)="handleClick()"
        ngpActionable
        role="button"
      >
        Custom Div Button
      </div>

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

    .custom-button {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      background-color: var(--ngp-background);
      color: var(--ngp-text-primary);
      font-weight: 500;
      box-shadow: var(--ngp-button-shadow);
      cursor: pointer;
      user-select: none;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .custom-button[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    .custom-button[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .custom-button[data-press] {
      background-color: var(--ngp-background-active);
    }

    .custom-button[data-disabled] {
      opacity: 0.5;
      cursor: not-allowed;
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
export default class ActionableExample {
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
