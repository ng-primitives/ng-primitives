import { Component, signal } from '@angular/core';
import { NgpFocusable } from 'ng-primitives/focusable';

@Component({
  selector: 'app-button-loading-example',
  imports: [NgpFocusable],
  template: `
    <p class="description">
      Use the keyboard to tab into the button and press Enter to see the loading state.
      <br />
      Focus remains on the button while loading.
    </p>

    <button
      [ngpFocusableDisabled]="loading()"
      [ngpFocusableWhenDisabled]="loading()"
      [aria-label]="loading() ? 'Submitting, please wait' : null"
      (click)="startLoading()"
      ngpFocusable
      type="submit"
    >
      @if (loading()) {
        <span class="loader" aria-hidden="true"></span>
        Submitting...
      } @else {
        Submit
      }
    </button>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      gap: 3rem;
      text-align: center;
    }

    .description {
      line-height: 1.5;
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
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      gap: 0.5rem;
    }
    [ngpFocusable]:disabled {
      pointer-events: none;
    }
    [ngpFocusable][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }
    [ngpFocusable][data-hover]:not([data-disabled]) {
      background-color: var(--ngp-background-hover);
    }
    [ngpFocusable][data-press]:not([data-disabled]) {
      background-color: var(--ngp-background-active);
    }
    [ngpFocusable][data-disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }
    [ngpFocusable] .loader {
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
  `,
})
export default class ButtonLoadingExample {
  readonly loading = signal(false);

  startLoading() {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 3000);
  }
}
