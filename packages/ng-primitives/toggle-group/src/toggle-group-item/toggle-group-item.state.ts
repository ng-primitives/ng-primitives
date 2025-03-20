import { Signal } from '@angular/core';
import { createState } from 'ng-primitives/state';

/**
 * The state for the toggle-group-item primitive.
 */
export interface NgpToggleGroupItemState {
  /**
   * The value of the item.
   */
  value: Signal<string | undefined>;

  /**
   * Whether the item is disabled.
   */
  disabled: Signal<boolean>;
}

/**
 * The initial state for the toggle-group-item primitive.
 */
export const {
  NgpToggleGroupItemStateToken,
  provideToggleGroupItemState,
  injectToggleGroupItemState,
  toggleGroupItemState,
} = createState<NgpToggleGroupItemState>('ToggleGroupItem');
