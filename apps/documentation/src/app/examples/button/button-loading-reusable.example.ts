import { Component, computed, input, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button',
  hostDirectives: [
    {
      directive: NgpButton,
      inputs: ['disabled', 'focusableWhenDisabled:loading'],
    },
  ],
  host: {
    '[attr.aria-label]': "isLoading() ? 'Submitting, please wait' : null",
  },
  template: `
    @if (isLoading()) {
      <span class="loader" aria-hidden="true"></span>
    }
    <ng-content />
  `,
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
    :host[data-hover] {
      background-color: var(--ngp-background-hover);
    }
    :host[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }
    :host[data-press] {
      background-color: var(--ngp-background-active);
    }
    :host[data-disabled] {
      opacity: 0.5;
      pointer-events: none;
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
  `,
})
export class Button {
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly isLoading = computed(() => this.disabled() && this.loading());
}

@Component({
  selector: 'app-focusable-loading-reusable-example',
  imports: [Button],
  template: `
    <app-button [disabled]="isLoading()" [loading]="isLoading()" (click)="startLoading()">
      Submit
    </app-button>
  `,
})
export default class FocusableLoadingReusableExample {
  readonly isLoading = signal(false);

  async startLoading() {
    this.isLoading.set(true);
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate loading
    this.isLoading.set(false);
  }
}
