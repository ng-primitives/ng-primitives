import { Component, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

/**
 * A custom button component that uses NgpButton via hostDirectives.
 * This pattern lets you create reusable button components with your own API
 * while inheriting all accessibility and interaction behavior.
 */
@Component({
  selector: 'app-custom-button',
  hostDirectives: [
    {
      directive: NgpButton,
      inputs: ['disabled', 'focusableWhenDisabled', 'tabIndex'],
    },
  ],
  template: `
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

    /* Custom variant styles */

    :host[data-variant='primary'] {
      background-color: var(--ngp-primary, #3b82f6);
      color: white;
    }

    :host[data-variant='primary'][data-hover] {
      background-color: var(--ngp-primary-hover, #2563eb);
    }

    :host[data-variant='primary'][data-focus-visible] {
      outline: 2px solid var(--ngp-background-inverse);
    }

    :host[data-variant='primary'][data-press] {
      background-color: var(--ngp-primary-active, #1d4ed8);
    }
  `,
  host: {
    '[attr.data-variant]': 'variant()',
  },
})
export class CustomButton {
  readonly variant = input<'default' | 'primary'>('default');
}

@Component({
  selector: 'app-button-custom-component-example',
  imports: [CustomButton],
  template: `
    <app-custom-button>Default</app-custom-button>
    <app-custom-button variant="primary">Primary</app-custom-button>
    <app-custom-button [disabled]="true">Disabled</app-custom-button>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
    }
  `,
})
export default class ButtonCustomComponentExample {}
