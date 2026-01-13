import { booleanAttribute, Component, computed, input, signal } from '@angular/core';
import { ngpActionable } from 'ng-primitives/actionable';
import { NgpButton } from 'ng-primitives/button';

@Component({
  selector: '[app-button]',
  hostDirectives: [
    {
      directive: NgpButton,
      inputs: ['disabled'],
    },
  ],
  host: {
    '[attr.aria-label]': 'loading() ? "Submitting, please wait" : null',
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
    :host:focus-visible,
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
    :host .loader {
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
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly actionable = ngpActionable({
    disabled: computed(() => this.disabled() || this.loading()),
    focusableWhenDisabled: this.loading,
  });
}

@Component({
  selector: 'app-button-loading-example',
  imports: [Button],
  template: `
    <button [loading]="loading()" (click)="startLoading()" app-button>
      {{ loading() ? 'Submitting...' : 'Submit' }}
    </button>
  `,
})
export default class ButtonLoadingExample {
  readonly loading = signal(false);

  startLoading() {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 3000);
  }
}
