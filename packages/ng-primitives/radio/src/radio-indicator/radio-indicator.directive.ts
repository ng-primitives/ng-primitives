/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, computed } from '@angular/core';
import { injectRadioGroup } from '../radio-group/radio-group.token';
import { injectRadioItem } from '../radio-item/radio-item.token';

@Directive({
  selector: '[ngpRadioIndicator]',
  standalone: true,
  host: {
    '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
    '[attr.data-disabled]': 'radioItem.disabled() ? "" : null',
  },
})
export class NgpRadioIndicator {
  /**
   * Access the radio group.
   */
  protected readonly radioGroup = injectRadioGroup();

  /**
   * Access the radio group item.
   */
  protected readonly radioItem = injectRadioItem();

  /**
   * Determine if the radio indicator is checked.
   */
  readonly checked = computed(() => this.radioGroup.value() === this.radioItem.value());
}
