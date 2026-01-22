import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpButton, provideButtonState } from './button-state';

/**
 * Adds accessible button behavior to any element with automatic role assignment,
 * keyboard activation, and interaction states.
 *
 * @usageNotes
 * ### Basic usage
 * ```html
 * <button ngpButton>Native button</button>
 * <div ngpButton>Custom button (gets role="button")</div>
 * ```
 *
 * ### With disabled state
 * ```html
 * <button ngpButton [disabled]="true" [focusableWhenDisabled]="true">Loading...</button>
 * ```
 *
 * ### Styling via data attributes
 * ```css
 * [data-hover] { background: lightblue; }
 * [data-press] { transform: scale(0.98); }
 * [data-focus-visible] { outline: 2px solid blue; }
 * [data-disabled] { opacity: 0.5; }
 * ```
 */
@Directive({
  selector: '[ngpButton]',
  exportAs: 'ngpButton',
  providers: [provideButtonState({ inherit: false })],
})
export class NgpButton {
  protected readonly elementRef = injectElementRef();

  /**
   * Whether the element is disabled. Applies native `disabled` on buttons/inputs,
   * `aria-disabled` on other elements, and blocks click/keyboard events.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Keep the element focusable when disabled. Useful for loading states where
   * users should discover and tab away from a disabled control.
   * @default false
   */
  readonly focusableWhenDisabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Tab index of the element.
   * Adjusted automatically when disabled based on `focusableWhenDisabled` setting.
   * @default 0
   */
  readonly tabIndex = input<number, NumberInput>(0, {
    transform: value => numberAttribute(value, 0),
  });

  /**
   * The ARIA role. Auto-assigned for non-native elements (`role="button"` on divs/spans).
   * Set to a custom role, `null` to remove, or `undefined` for automatic assignment.
   */
  readonly role = input<string | null>();

  protected readonly state = ngpButton({
    disabled: this.disabled,
    focusableWhenDisabled: this.focusableWhenDisabled,
    tabIndex: this.tabIndex,
    role: this.role,
  });

  /** Programmatically set the disabled state. */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }

  /** Programmatically set whether the element is focusable when disabled. */
  setFocusableWhenDisabled(value: boolean): void {
    this.state.setFocusableWhenDisabled(value);
  }

  /** Programmatically set the tab index. */
  setTabIndex(value: number): void {
    this.state.setTabIndex(value);
  }

  /** Programmatically set the role. Use `null` to remove, `undefined` for auto-assignment. */
  setRole(value: string | null | undefined): void {
    this.state.setRole(value);
  }
}
