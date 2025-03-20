/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, computed } from '@angular/core';
import { NgpHover, NgpPress } from 'ng-primitives/interactions';
import { injectRadioGroupState } from '../radio-group/radio-group.state';
import { injectRadioItemState } from '../radio-item/radio-item.state';

@Directive({
  selector: '[ngpRadioIndicator]',
  host: {
    '[attr.data-checked]': 'checked() ? "" : null',
    '[attr.data-disabled]': 'radioItemState.disabled() ? "" : null',
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
    () => this.radioGroupState.value() === this.radioItemState.value(),
  );
}
