import { Component, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

/**
 * The size of the button.
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'button[app-button]',
  hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }],
  template: '<ng-content />',
  host: {
    '[attr.data-size]': 'size()',
  },
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

    /* Size variants */
    :host[data-size='sm'] {
      height: 2rem;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      font-size: 0.875rem;
    }

    :host[data-size='md'],
    :host:not([data-size]) {
      height: 2.5rem;
      padding-left: 1rem;
      padding-right: 1rem;
      font-size: 0.875rem;
    }

    :host[data-size='lg'] {
      height: 3rem;
      padding-left: 1.25rem;
      padding-right: 1.25rem;
      font-size: 1rem;
    }

    :host[data-size='xl'] {
      height: 3.5rem;
      padding-left: 1.5rem;
      padding-right: 1.5rem;
      font-size: 1.125rem;
    }
  `,
})
export class Button {
  /**
   * The size of the button.
   */
  readonly size = input<ButtonSize>('md');
}

@Component({
  selector: 'app-button-sizes-example',
  imports: [Button],
  template: `
    <div class="button-container">
      <button size="sm" app-button>Small</button>
      <button app-button>Medium</button>
      <button size="lg" app-button>Large</button>
      <button size="xl" app-button>Extra Large</button>
    </div>
  `,
  styles: `
    .button-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
    }
  `,
})
export default class ButtonSizesExample {}
