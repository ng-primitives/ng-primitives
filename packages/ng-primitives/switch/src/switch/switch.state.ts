import { OutputEmitterRef, Signal } from '@angular/core';
import { createState } from 'ng-primitives/state';

/**
 * The state for the switch primitive.
 */
export interface NgpSwitchState {
  /**
   * Determine if the switch is checked.
   */
  checked: Signal<boolean>;
  /**
   * Emits when the checked state changes.
   */
  checkedChange: OutputEmitterRef<boolean>;
  /**
   * Determine if the switch is disabled.
   */
  disabled: Signal<boolean>;
}

/**
 * The initial state for the switch primitive.
 */
export const { NgpSwitchStateToken, provideSwitchState, injectSwitchState, switchState } =
  createState<NgpSwitchState>('Switch');
