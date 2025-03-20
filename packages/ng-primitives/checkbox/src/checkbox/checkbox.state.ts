import { OutputEmitterRef, Signal } from '@angular/core';
import { createState } from 'ng-primitives/state';

/**
 * The state for the checkbox primitive.
 */
export interface NgpCheckboxState {
  /**
   * The id of the checkbox.
   */
  id: Signal<string>;
  /**
   * The checked state of the checkbox.
   */
  checked: Signal<boolean>;
  /**
   * The checked change event of the checkbox.
   */
  checkedChange: OutputEmitterRef<boolean>;
  /**
   * The indeterminate state of the checkbox.
   * @default false
   */
  indeterminate: Signal<boolean>;
  /**
   * The indeterminate change event of the checkbox.
   */
  indeterminateChange: OutputEmitterRef<boolean>;
  /**
   * The required state of the checkbox.
   * @default false
   */
  required: Signal<boolean>;
  /**
   * The disabled state of the checkbox.
   * @default false
   */
  disabled: Signal<boolean>;
}

/**
 * The initial state for the checkbox primitive.
 */
export const { NgpCheckboxStateToken, provideCheckboxState, injectCheckboxState, checkboxState } =
  createState<NgpCheckboxState>('Checkbox');
