import { Signal } from '@angular/core';
import { createState } from 'ng-primitives/state';
import type { NgpProgressValueLabelFn } from './progress';

/**
 * The state for the progress primitive.
 */
export interface NgpProgressState {
  /**
   * The progress value.
   */
  value: Signal<number>;

  /**
   * The progress max value.
   */
  max: Signal<number>;

  /**
   * The progress value label.
   */
  valueLabel: Signal<NgpProgressValueLabelFn>;
}

/**
 * The initial state for the progress primitive.
 */
export const { NgpProgressStateToken, provideProgressState, injectProgressState, progressState } =
  createState<NgpProgressState>('Progress');
