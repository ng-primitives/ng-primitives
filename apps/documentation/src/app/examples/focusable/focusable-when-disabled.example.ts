import { Component, signal } from '@angular/core';
import { NgpFocusable } from 'ng-primitives/focusable';

@Component({
  selector: 'app-focusable-when-disabled',
  imports: [NgpFocusable],
  template: `
    <div class="demo">
      <p class="description">
        Click the submit button to see the loading state. Focus remains on the button while loading.
      </p>

      <button
        [ngpFocusableDisabled]="loading()"
        [ngpFocusableWhenDisabled]="true"
        (click)="submit()"
        ngpFocusable
      >
        @if (loading()) {
          <span class="spinner"></span>
          Loading...
        } @else {
          Submit
        }
      </button>

      <span class="status">
        @if (loading()) {
          Processing... (focus remains on button)
        } @else {
          Ready
        }
      </span>
    </div>
  `,
  styles: `
    .demo {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: flex-start;
    }

    .description {
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      margin: 0;
    }

    .status {
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
    }

    [ngpFocusable] {
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
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    [ngpFocusable][data-hover]:not([data-disabled]) {
      background-color: var(--ngp-background-hover);
    }

    [ngpFocusable][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpFocusable][data-press]:not([data-disabled]) {
      background-color: var(--ngp-background-active);
    }

    [ngpFocusable][data-disabled] {
      opacity: 0.7;
      cursor: wait;
    }

    .spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top-color: currentColor;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `,
})
export default class focusableFocusableWhenDisabledExample {
  loading = signal(false);

  submit(): void {
    this.loading.set(true);

    // Simulate async operation
    setTimeout(() => {
      this.loading.set(false);
    }, 2000);
  }
}
