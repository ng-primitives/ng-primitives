import { booleanAttribute, Component, input, signal } from '@angular/core';
import { NgpFocusable } from 'ng-primitives/focusable';

@Component({
  selector: 'app-button',
  hostDirectives: [
    {
      directive: NgpFocusable,
      inputs: ['ngpFocusableDisabled:disabled', 'ngpFocusableWhenDisabled:loading'],
    },
  ],
  host: {
    '[attr.aria-label]': "loading() ? 'Submitting, please wait' : null",
  },
  template: `
    @if (loading()) {
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
  `,
})
export class Button {
  readonly loading = input(false, { transform: booleanAttribute });
}

@Component({
  selector: 'app-focusable-loading-reusable-example',
  imports: [Button],
  template: `
    <app-button [loading]="loading()" [disabled]="loading()" (click)="startLoading()">
      Submit
    </app-button>
  `,
})
export default class focusableLoadingReusableExample {
  readonly loading = signal(false);

  startLoading() {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 3000);
  }
}
