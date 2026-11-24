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

const FOCUSED_ON_PRESS_SELECTOR =
  'select, textarea, input:not([type=button], [type=submit], [type=reset], [type=image], [type=checkbox], [type=radio])';

/**
 * Answers the press question: whether a mouse press on the event target has to move focus there
 * for the control to work. True for a field the user types into, editable content, a select, and
 * the inputs a press drives, such as a slider, which does not move once the press is prevented.
 */
export function needsFocusOnPress(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    (!!target.closest(FOCUSED_ON_PRESS_SELECTOR) ||
      (target instanceof HTMLElement && target.isContentEditable))
  );
}

const SINGLE_LINE_TEXT_TYPES = ['text', 'search', 'email', 'url', 'tel', 'password'];
const KEYS_WITHOUT_USE_IN_A_TEXT_FIELD = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'];

/**
 * Answers the keys question: whether the key was pressed in a single-line field the user types
 * into and is one that field has no use for, so the list may take it. Every other key is the
 * field's: a space, Home and End. So is every key of another field: the arrows step a number, a
 * date or a slider, and Enter breaks a line in a textarea.
 */
export function isKeyATextFieldLeavesToTheList({ target, key }: KeyboardEvent): boolean {
  return (
    target instanceof HTMLInputElement &&
    // The `type` property reads a missing or unknown type as `text`.
    SINGLE_LINE_TEXT_TYPES.includes(target.type) &&
    KEYS_WITHOUT_USE_IN_A_TEXT_FIELD.includes(key)
  );
}
