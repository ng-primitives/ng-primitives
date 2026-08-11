import { Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding } from 'ng-primitives/state';
import type { NgpDatePickerDateButton } from '../date-picker-date-button/date-picker-date-button';

export interface NgpDatePickerCellState {}

export interface NgpDatePickerCellProps {
  /**
   * The date button rendered inside the cell, if any.
   */
  readonly button: Signal<NgpDatePickerDateButton<unknown> | undefined>;
}

export const [
  NgpDatePickerCellStateToken,
  ngpDatePickerCell,
  injectDatePickerCellState,
  provideDatePickerCellState,
] = createPrimitive(
  'NgpDatePickerCell',
  ({ button }: NgpDatePickerCellProps): NgpDatePickerCellState => {
    const elementRef = injectElementRef();

    // Host bindings — the cell mirrors the state of its date button. Its
    // accessible name comes from the button's day content, not the shared
    // month/year label (which would make every cell announce the month).
    attrBinding(elementRef, 'role', 'gridcell');
    dataBinding(elementRef, 'data-selected', () => (button()?.selected() ? '' : null));
    attrBinding(elementRef, 'aria-selected', () => button()?.selected() ?? null);
    attrBinding(elementRef, 'aria-disabled', () => button()?.disabled() ?? null);
    dataBinding(elementRef, 'data-disabled', () => (button()?.disabled() ? '' : null));

    return {} satisfies NgpDatePickerCellState;
  },
);
