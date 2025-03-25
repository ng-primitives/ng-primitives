import { OutputEmitterRef, Signal } from '@angular/core';
import { createState } from 'ng-primitives/state';

/**
 * The state for the toggle primitive.
 */
export interface NgpToggleState {
  /**
   * Whether the toggle is selected.
   */
  selected: Signal<boolean>;
  /**
   * Emits when the selected state changes.
   */
  selectedChange: OutputEmitterRef<boolean>;
  /**
   * Whether the toggle is disabled.
   */
  disabled: Signal<boolean>;
}

/**
 * The initial state for the toggle primitive.
 */
export const { NgpToggleStateToken, provideToggleState, injectToggleState, toggleState } =
  createState<NgpToggleState>('Toggle');
