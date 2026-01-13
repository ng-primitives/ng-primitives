import { Component, signal } from '@angular/core';
import { NgpActionable } from 'ng-primitives/actionable';

@Component({
  selector: 'app-actionable-focusable-example',
  imports: [NgpActionable],
  template: `
    <div class="example-container">
      <p class="instructions">
        Tab to the button, click it, and notice focus remains on the button while loading.
      </p>

      <button
        class="submit-button"
        [ngpActionableDisabled]="loading()"
        [attr.aria-label]="loading() ? 'Submitting, please wait' : null"
        (click)="startLoading()"
        ngpActionable
        ngpActionableFocusableWhenDisabled
      >
        @if (loading()) {
          <span class="loader" aria-hidden="true"></span>
          Submitting...
        } @else {
          Submit
        }
      </button>

      <p class="status">
        @if (loading()) {
          Processing your request...
        } @else {
          Ready to submit
        }
      </p>
    </div>
  `,
  styles: `
    .example-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .instructions {
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      margin: 0;
    }

    .submit-button {
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      background-color: var(--ngp-background);
      color: var(--ngp-text-primary);
      font-weight: 500;
      border: none;
      box-shadow: var(--ngp-button-shadow);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .submit-button[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    .submit-button[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .submit-button[data-press] {
      background-color: var(--ngp-background-active);
    }

    .submit-button[data-disabled] {
      opacity: 0.6;
      cursor: default;
    }

    .loader {
      width: 1rem;
      height: 1rem;
      border: 2px solid var(--ngp-text-primary);
      border-bottom-color: transparent;
      border-radius: 50%;
      display: inline-block;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }

    @keyframes rotation {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .status {
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      margin: 0;
    }
  `,
})
export default class ActionableFocusableExample {
  readonly loading = signal(false);

  startLoading(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 3000);
  }
}
