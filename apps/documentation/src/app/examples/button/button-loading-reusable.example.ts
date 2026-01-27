import { Component, computed, signal } from '@angular/core';
import { injectButtonState, NgpButton } from 'ng-primitives/button';

@Component({
  selector: 'app-button',
  hostDirectives: [
    {
      directive: NgpButton,
      inputs: ['disabled', 'focusableWhenDisabled'],
    },
  ],
  host: {
    '[attr.aria-label]': "isLoading() ? 'Loading, please wait' : null",
  },
  template: `
    <span class="loader" aria-hidden="true"></span>
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
      cursor: not-allowed;
    }

    .loader {
      width: 1rem;
      height: 1rem;
      border: 2px solid var(--ngp-text-primary);
      border-bottom-color: transparent;
      border-radius: 50%;
      display: none;
      box-sizing: border-box;
      animation: rotation 1s linear infinite;
    }

    :host[data-disabled-focusable] .loader {
      display: inline-block;
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
  readonly state = injectButtonState();
  readonly isLoading = computed(
    () => this.state().disabled() && this.state().focusableWhenDisabled(),
  );
}

@Component({
  selector: 'app-focusable-loading-reusable-example',
  imports: [Button],
  template: `
    <app-button [disabled]="loading()" [focusableWhenDisabled]="loading()" (click)="startLoading()">
      Submit
    </app-button>
  `,
})
export default class ButtonLoadingReusableExample {
  readonly loading = signal(false);

  async startLoading() {
    this.loading.set(true);
    await new Promise(res => setTimeout(res, 3000)); // Simulate loading
    this.loading.set(false);
  }
}
