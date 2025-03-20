import { Signal } from '@angular/core';
import { createState } from 'ng-primitives/state';

/**
 * The state for the radio-item primitive.
 */
export interface NgpRadioItemState {
  /**
   * The value of the radio item.
   */
  value: Signal<string>;
  /**
   * Whether the radio item is disabled.
   */
  disabled: Signal<boolean>;
}

/**
 * The initial state for the radio-item primitive.
 */
export const {
  NgpRadioItemStateToken,
  provideRadioItemState,
  injectRadioItemState,
  radioItemState,
} = createState<NgpRadioItemState>('RadioItem');
