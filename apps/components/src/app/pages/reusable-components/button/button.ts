import { Component, input } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';

/**
 * The size of the button.
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * The variant of the button.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';

@Component({
  selector: 'button[app-button]',
  standalone: true,
  hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }],
  template: `
    <span class="icon-left">
      <ng-content select="[slot=left]" />
    </span>
    <ng-content />
    <span class="icon-right">
      <ng-content select="[slot=right]" />
    </span>
  `,
  host: {
    '[attr.data-size]': 'size()',
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
      gap: 0.5rem;
    }

    .icon-left {
      margin-right: 0.25rem;
      display: inline-flex;
      align-items: center;
    }

    .icon-right {
      margin-left: 0.25rem;
      display: inline-flex;
      align-items: center;
    }

    .icon-small {
      height: 1rem;
      width: 1rem;
    }

    .icon-medium {
      height: 1.25rem;
      width: 1.25rem;
    }

    .icon-large {
      height: 1.5rem;
      width: 1.5rem;
    }

    .icon-xlarge {
      height: 1.75rem;
      width: 1.75rem;
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

  /**
   * The variant of the button.
   */
  readonly variant = input<ButtonVariant>('primary');

  /**
   * Map of button sizes to icon classes
   */
  private readonly sizeToIconClassMap: Record<ButtonSize, string> = {
    sm: 'icon-small',
    md: 'icon-medium',
    lg: 'icon-large',
    xl: 'icon-xlarge',
  };

  /**
   * Returns the appropriate icon class based on button size
   */
  protected iconClass(): string {
    return this.sizeToIconClassMap[this.size()] || 'icon-medium';
  }
}
