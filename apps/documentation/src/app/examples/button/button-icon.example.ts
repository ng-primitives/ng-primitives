import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowRight,
  lucideCheck,
  lucideChevronRight,
  lucideShoppingBasket,
} from '@ng-icons/lucide';
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
  imports: [NgIcon],
  hostDirectives: [{ directive: NgpButton, inputs: ['disabled'] }],
  template: `
    @if (hasLeftSlotContent()) {
      <span class="icon-left">
        <ng-content select="[slot=left]" />
      </span>
    }
    <ng-content />
    @if (hasRightSlotContent()) {
      <span class="icon-right">
        <ng-content select="[slot=right]" />
      </span>
    }
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

    /* Button already has display: inline-flex, align-items and justify-content in :host */

    .icon-left {
      margin-right: 0.5rem;
      display: inline-flex;
      align-items: center;
    }

    .icon-right {
      margin-left: 0.5rem;
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

    /* Variant styles */
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
      background-color: var(--ngp-background-active);
    }

    :host[data-variant='link'] {
      background-color: transparent;
      color: var(--ngp-link-color, #3b82f6);
      border: none;
      box-shadow: none;
      text-decoration: underline;
      text-underline-offset: 4px;
    }

    :host[data-variant='link'][data-hover] {
      text-decoration-thickness: 2px;
    }

    :host[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
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
   * Flag indicating if there is content in the left slot.
   * This should be set to true when using the left slot for icons or other content.
   */
  readonly hasLeftSlotContent = input<boolean>(false);

  /**
   * Flag indicating if there is content in the right slot.
   * This should be set to true when using the right slot for icons or other content.
   */
  readonly hasRightSlotContent = input<boolean>(false);

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

@Component({
  selector: 'app-button-icon-example',
  standalone: true,
  imports: [Button, NgIcon],
  providers: [
    provideIcons({ lucideArrowRight, lucideCheck, lucideChevronRight, lucideShoppingBasket }),
  ],
  template: `
    <div class="button-container">
      <h3>Button with left icon</h3>
      <div class="button-row">
        <button [hasLeftSlotContent]="true" app-button>
          <ng-icon slot="left" name="lucideArrowRight" />
          Left Icon
        </button>
        <button [hasLeftSlotContent]="true" app-button variant="secondary">
          <ng-icon slot="left" name="lucideCheck" />
          Left Icon
        </button>
        <button [hasLeftSlotContent]="true" app-button variant="destructive">
          <ng-icon slot="left" name="lucideShoppingBasket" />
          Left Icon
        </button>
        <button [hasLeftSlotContent]="true" app-button variant="outline">
          <ng-icon slot="left" name="lucideChevronRight" />
          Left Icon
        </button>
      </div>

      <h3>Button with right icon</h3>
      <div class="button-row">
        <button [hasRightSlotContent]="true" app-button>
          Right Icon
          <ng-icon slot="right" name="lucideArrowRight" />
        </button>
        <button [hasRightSlotContent]="true" app-button variant="secondary">
          Right Icon
          <ng-icon slot="right" name="lucideCheck" />
        </button>
        <button [hasRightSlotContent]="true" app-button variant="destructive">
          Right Icon
          <ng-icon slot="right" name="lucideShoppingBasket" />
        </button>
        <button [hasRightSlotContent]="true" app-button variant="outline">
          Right Icon
          <ng-icon slot="right" name="lucideChevronRight" />
        </button>
      </div>

      <h3>Button sizes with icons</h3>
      <div class="button-row">
        <button [hasLeftSlotContent]="true" [hasRightSlotContent]="true" app-button size="sm">
          <ng-icon slot="left" name="lucideArrowRight" />
          Small
          <ng-icon slot="right" name="lucideCheck" />
        </button>
        <button [hasLeftSlotContent]="true" [hasRightSlotContent]="true" app-button>
          <ng-icon slot="left" name="lucideArrowRight" />
          Medium
          <ng-icon slot="right" name="lucideCheck" />
        </button>
        <button [hasLeftSlotContent]="true" [hasRightSlotContent]="true" app-button size="lg">
          <ng-icon slot="left" name="lucideArrowRight" />
          Large
          <ng-icon slot="right" name="lucideCheck" />
        </button>
        <button [hasLeftSlotContent]="true" [hasRightSlotContent]="true" app-button size="xl">
          <ng-icon slot="left" name="lucideArrowRight" />
          Extra Large
          <ng-icon slot="right" name="lucideCheck" />
        </button>
      </div>
    </div>
  `,
  styles: `
    .button-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .button-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
    }

    h3 {
      margin-bottom: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
    }
  `,
})
export default class ButtonIconExample {}
