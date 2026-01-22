import { Directive, input } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpDisableBase, provideDisableState } from 'packages/ng-primitives/disable/src';
import { ngpButton, NgpButtonState, provideButtonState } from './button-state';

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
  providers: [provideDisableState({ inherit: false }), provideButtonState({ inherit: false })],
})
export class NgpButton extends NgpDisableBase<NgpButtonState> {
  /**
   * The ARIA role. Auto-assigned for non-native elements (`role="button"` on divs/spans).
   * Set to a custom role, `null` to remove, or `undefined` for automatic assignment.
   */
  readonly role = input<string | null | undefined>(
    injectElementRef().nativeElement.getAttribute('role') ?? undefined,
  );

  protected override readonly state = ngpButton({
    disabled: this.disabled,
    focusableWhenDisabled: this.focusableWhenDisabled,
    tabIndex: this.tabIndex,
    ariaDisabled: this.ariaDisabled,
    role: this.role,
  });

  /** Programmatically set the role. Use `null` to remove, `undefined` for auto-assignment. */
  setRole(value: string | null | undefined): void {
    this.state.setRole(value);
  }
}
