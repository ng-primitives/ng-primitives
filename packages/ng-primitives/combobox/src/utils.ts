import type { NgpComboboxOptionState } from './combobox-option/combobox-option-state';

/**
 * Check if all regular options (excluding 'all' and undefined) are selected.
 * @param options All available options
 * @param selectedValues Currently selected values
 * @param compareWith Comparison function
 * @returns true if all regular options are selected
 */
export function areAllOptionsSelected(
  options: NgpComboboxOptionState[],
  selectedValues: any[],
  compareWith: (a: any, b: any) => boolean,
): boolean {
  const regularOptions = options
    .map(opt => ({ opt, value: opt.value() }))
    .filter(({ value }) => value !== 'all' && value !== undefined);
  return (
    regularOptions.length > 0 &&
    regularOptions.every(({ value }) => selectedValues.some(val => compareWith(val, value)))
  );
}
