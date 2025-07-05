import { Component, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';



/**
 * The variant of the button.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

@Component({
  selector: 'button[app-button]',
  hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }],
  template: '<ng-content />',
  host: {
    '[attr.data-variant]': 'variant()',
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
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    :host[data-variant='primary'],
    :host:not([data-variant]) {
      background-color: var(--ngp-background);
      color: var(--ngp-text-primary);
      border: none;
    }

    :host[data-variant='primary'][data-hover],
    :host:not([data-variant])[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    :host[data-variant='primary'][data-press],
    :host:not([data-variant])[data-press] {
      background-color: var(--ngp-background-active);
    }

    :host[data-variant='secondary'] {
      background-color: var(--ngp-secondary-background, #f1f5f9);
      color: var(--ngp-secondary-text, #0f172a);
      border: none;
    }

    :host[data-variant='secondary'][data-hover] {
      background-color: var(--ngp-secondary-background-hover, #e2e8f0);
    }

    :host[data-variant='secondary'][data-press] {
      background-color: var(--ngp-secondary-background-active, #cbd5e1);
    }

    :host[data-variant='destructive'] {
      background-color: var(--ngp-destructive-background, #ef4444);
      color: var(--ngp-destructive-text, #ffffff);
      border: none;
    }

    :host[data-variant='destructive'][data-hover] {
      background-color: var(--ngp-destructive-background-hover, #dc2626);
    }

    :host[data-variant='destructive'][data-press] {
      background-color: var(--ngp-destructive-background-active, #b91c1c);
    }

    :host[data-variant='outline'] {
      background-color: transparent;
      color: var(--ngp-text-primary);
      border: 1px solid var(--ngp-outline-border, #e2e8f0);
      box-shadow: none;
    }

    :host[data-variant='outline'][data-hover] {
      background-color: var(--ngp-background-hover);
      border-color: var(--ngp-outline-border-hover, #cbd5e1);
    }

    :host[data-variant='outline'][data-press] {
      background-color: var(--ngp-outline-background-active, rgba(15, 23, 42, 0.1));
    }

    :host[data-variant='ghost'] {
      background-color: transparent;
      color: var(--ngp-text-primary);
      border: none;
      box-shadow: none;
    }

    :host[data-variant='ghost'][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    :host[data-variant='ghost'][data-press] {
      background-color: var(--ngp-ghost-background-active, rgba(15, 23, 42, 0.1));
    }

    :host[data-variant='link'] {
      background-color: transparent;
      color: var(--ngp-text-primary);
      border: none;
      box-shadow: none;
      text-decoration-line: none;
      height: auto;
      padding: 0;
    }

    :host[data-variant='link'][data-hover] {
      text-decoration-line: underline;
    }

    :host[data-variant='link'][data-press] {
      text-decoration-line: underline;
    }

    :host[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }


  `,
})
export class Button {


  /**
   * The variant of the button.
   */
  readonly variant = input<ButtonVariant>('primary');
}


@Component({
  selector: 'app-button-variants-example',
  standalone: true,
  imports: [Button],
  template: `
    <div class="button-container">
      <button app-button>Primary</button>
      <button variant="secondary" app-button>Secondary</button>
      <button variant="destructive" app-button>Destructive</button>
      <button variant="outline" app-button>Outline</button>
      <button variant="ghost" app-button>Ghost</button>
      <button variant="link" app-button>Link</button>
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
export default class ButtonVariantsExample {}
