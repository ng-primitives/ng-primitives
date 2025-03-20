import { OutputEmitterRef, Signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { createState } from 'ng-primitives/state';

/**
 * The state for the toggle-group primitive.
 */
export interface NgpToggleGroupState {
  /**
   * The orientation of the toggle group.
   */
  orientation: Signal<NgpOrientation>;
  /**
   * The type of the toggle group, whether only one item can be selected or multiple.
   */
  type: Signal<'single' | 'multiple'>;
  /**
   * The selected value(s) of the toggle group.
   */
  value: Signal<string[]>;
  /**
   * Emits when the value of the toggle group changes.
   */
  valueChange: OutputEmitterRef<string[]>;
  /**
   * Whether the toggle group is disabled.
   */
  disabled: Signal<boolean>;
}

/**
 * The initial state for the toggle-group primitive.
 */
export const {
  NgpToggleGroupStateToken,
  provideToggleGroupState,
  injectToggleGroupState,
  toggleGroupState,
} = createState<NgpToggleGroupState>('ToggleGroup');
