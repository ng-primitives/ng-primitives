import { OutputEmitterRef, Signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { createState } from 'ng-primitives/state';

/**
 * The state for the radio-group primitive.
 */
export interface NgpRadioGroupState {
  /**
   * The value of the radio group.
   */
  value: Signal<string | null>;
  /**
   * Event emitted when the radio group value changes.
   */
  valueChange: OutputEmitterRef<string | null>;
  /**
   * Whether the radio group is disabled.
   */
  disabled: Signal<boolean>;
  /**
   * The orientation of the radio group.
   */
  orientation: Signal<NgpOrientation>;
}

/**
 * The initial state for the radio-group primitive.
 */
export const {
  NgpRadioGroupStateToken,
  provideRadioGroupState,
  injectRadioGroupState,
  radioGroupState,
} = createState<NgpRadioGroupState>('RadioGroup');
