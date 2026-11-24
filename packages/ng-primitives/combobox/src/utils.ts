import type { NgpComboboxOption } from './combobox-option/combobox-option';

/**
 * Check if all regular options (excluding 'all' and undefined) are selected.
 * @param options All available options
 * @param selectedValues Currently selected values
 * @param compareWith Comparison function
 * @returns true if all regular options are selected
 */
export function areAllOptionsSelected(
  options: NgpComboboxOption[],
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

const TEXT_FIELD_SELECTOR =
  'textarea, input:not([type=button], [type=submit], [type=reset], [type=image], [type=checkbox], [type=radio])';

/** Whether the event target is a field the user types into, which works only while it has focus. */
export function isTextField(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || target.matches(TEXT_FIELD_SELECTOR))
  );
}

/**
 * Whether a mouse press on the event target has to move focus there for the control to work:
 * a text field, or a select, which opens its picker on the press.
 */
export function needsFocusOnPress(target: EventTarget | null): boolean {
  return isTextField(target) || (target instanceof Element && !!target.closest('select'));
}
