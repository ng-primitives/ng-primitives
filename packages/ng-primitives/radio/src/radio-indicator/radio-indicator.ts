import { Directive, computed } from '@angular/core';
import { injectRadioItemState } from '../radio-item/radio-item-state';

/**
 * Apply the `ngpRadioIndicator` directive to an element that represents the radio indicator (i.e. the dot).
 */
@Directive({
  selector: '[ngpRadioIndicator]',
  host: {
    '[attr.data-checked]': 'checked() ? "" : null',
    '[attr.data-disabled]': 'radioItemState().disabled() ? "" : null',
  },
})
export class NgpRadioIndicator<T> {
  /**
   * Access the radio group item state
   */
  protected readonly radioItemState = injectRadioItemState<T>();

  /**
   * Determine if the radio indicator is checked. Delegates to the item's
   * checked state so it honours the group's `compareWith` comparator.
   */
  protected readonly checked = computed(() => this.radioItemState().checked());
}
