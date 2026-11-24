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

const NEEDS_FOCUS_ON_PRESS_SELECTOR =
  'select, textarea, input:not([type=button], [type=submit], [type=reset], [type=image], [type=checkbox], [type=radio])';

/**
 * Whether the control under a mouse press works only once the press has moved focus to it: a
 * field the user types into, editable content, a select, and the inputs a press drives, such as a
 * slider, which does not move once the press is prevented.
 */
export function needsFocusOnPress(target: EventTarget | null): boolean {
  return (
    target instanceof Element &&
    (!!target.closest(NEEDS_FOCUS_ON_PRESS_SELECTOR) ||
      (target instanceof HTMLElement && target.isContentEditable))
  );
}

const SINGLE_LINE_TEXT_TYPES = ['text', 'search', 'email', 'url', 'tel', 'password'];
const LIST_KEYS = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'];

/**
 * Whether the field the key was pressed in has no use for it, so the list may take it: a list key
 * on its own in a single-line field the user types into. Every other key is the field's: a space,
 * Home and End, and a list key held with a modifier, such as Alt+ArrowDown, which opens the
 * field's suggestions. So is every key of another field: the arrows step a number, a date or a
 * slider, and Enter breaks a line in a textarea.
 */
export function leavesKeyToList(event: KeyboardEvent): boolean {
  const { target, key } = event;

  return (
    target instanceof HTMLInputElement &&
    // The `type` property reads a missing or unknown type as `text`.
    SINGLE_LINE_TEXT_TYPES.includes(target.type) &&
    LIST_KEYS.includes(key) &&
    !hasModifier(event)
  );
}

function hasModifier({ altKey, ctrlKey, metaKey, shiftKey }: KeyboardEvent): boolean {
  return altKey || ctrlKey || metaKey || shiftKey;
}
