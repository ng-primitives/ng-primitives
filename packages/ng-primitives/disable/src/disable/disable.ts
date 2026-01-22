import { Directive } from '@angular/core';
import { NgpDisableBase } from './disable-base';
import { ngpDisable, NgpDisableState, provideDisableState } from './disable-state';

/**
 * Adds disabled behavior to any element with optional focusable-when-disabled support.
 *
 * @usageNotes
 * ### Basic usage
 * ```html
 * <button ngpDisable [disabled]="isLoading">Submit</button>
 * ```
 *
 * ### Focusable when disabled (for loading states)
 * ```html
 * <button ngpDisable [disabled]="true" [focusableWhenDisabled]="true">
 *   Loading...
 * </button>
 * ```
 *
 * ### Styling
 * ```css
 * [data-disabled] { opacity: 0.5; cursor: not-allowed; }
 * [data-focusable-disabled] { /* loading indicator styles *\/ }
 * ```
 */
@Directive({
  selector: '[ngpDisable]',
  exportAs: 'ngpDisable',
  providers: [provideDisableState({ inherit: false })],
})
export class NgpDisable extends NgpDisableBase<NgpDisableState> {
  protected override readonly state = ngpDisable({
    disabled: this.disabled,
    focusableWhenDisabled: this.focusableWhenDisabled,
    tabIndex: this.tabIndex,
    ariaDisabled: this.ariaDisabled,
  });
}
