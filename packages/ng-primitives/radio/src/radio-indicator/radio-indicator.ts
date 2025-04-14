import { Directive, computed } from '@angular/core';
import { NgpHover, NgpPress } from 'ng-primitives/interactions';
import { injectRadioGroupState } from '../radio-group/radio-group-state';
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
  hostDirectives: [NgpHover, NgpPress],
})
export class NgpRadioIndicator {
  /**
   * Access the radio group state.
   */
  protected readonly radioGroupState = injectRadioGroupState();

  /**
   * Access the radio group item state
   */
  protected readonly radioItemState = injectRadioItemState();

  /**
   * Determine if the radio indicator is checked.
   */
  protected readonly checked = computed(
    () => this.radioGroupState().value() === this.radioItemState().value(),
  );
}
