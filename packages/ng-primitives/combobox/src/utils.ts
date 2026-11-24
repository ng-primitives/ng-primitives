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

// A `tabindex` of -1 keeps an element out of the tab order and asks for no focus on a press: the
// combobox's list and its options carry one.
const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [contenteditable]:not([contenteditable=false]), [tabindex]:not([tabindex="-1"])';
// Controls that act on a click and need no focus for it, by element and by role.
const ACTS_WITHOUT_FOCUS_SELECTOR =
  'button, input:is([type=button], [type=submit], [type=reset], [type=image], [type=checkbox], [type=radio])';
const ACTS_WITHOUT_FOCUS_ROLES = ['button', 'option'];

/**
 * Whether a mouse press in the dropdown moves focus: it does when the nearest focusable element
 * around the press, inside the dropdown, is anything but a button-like control or an option: a
 * field, a select, editable content, a link, a custom widget with a `tabindex` other than -1. A
 * press on any other content leaves focus where it is.
 */
export function takesFocusOnPress(event: MouseEvent): boolean {
  // From the element pressed, not `event.target`, which for a press inside a web component is
  // its host, up to the dropdown the press is handled on.
  const path = event.composedPath();
  const focusable = path
    .slice(0, path.indexOf(event.currentTarget!))
    .find(
      (target): target is Element =>
        target instanceof Element && target.matches(FOCUSABLE_SELECTOR),
    );

  return !!focusable && !actsWithoutFocus(focusable);
}

function actsWithoutFocus(element: Element): boolean {
  const role = roleOf(element);

  return (
    element.matches(ACTS_WITHOUT_FOCUS_SELECTOR) ||
    (!!role && ACTS_WITHOUT_FOCUS_ROLES.includes(role))
  );
}

const SINGLE_LINE_TEXT_TYPES = ['text', 'search', 'email', 'url', 'tel', 'password'];
const TEXT_FIELD_ROLES = ['textbox', 'searchbox', 'combobox'];
const LIST_KEYS = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape'];
// ASCII whitespace, which separates the tokens of an HTML attribute.
const HTML_TOKEN_SEPARATOR = /[\t\n\f\r ]+/;

/**
 * Whether the field the key was pressed in has no use for it, so the list may take it: a list key
 * on its own in a single-line field the user types into. Every other key is the field's: a space,
 * Home and End, a list key held with a modifier, such as Alt+ArrowDown, which opens the field's
 * suggestions, and a key that belongs to an IME composition. So is every key of another field:
 * the arrows step a number, a date, a slider or a text input given the role of a spin button, and
 * Enter breaks a line in a textarea.
 */
export function leavesKeyToList(event: KeyboardEvent): boolean {
  const { target, key } = event;

  return (
    target instanceof HTMLInputElement &&
    // The `type` property reads a missing or unknown type as `text`.
    SINGLE_LINE_TEXT_TYPES.includes(target.type) &&
    hasTextFieldRole(target) &&
    LIST_KEYS.includes(key) &&
    !hasModifier(event) &&
    !isPartOfComposition(event)
  );
}

/**
 * Whether the input is a text field to assistive technology as well: an explicit role of another
 * widget, such as `spinbutton`, says its keys drive that widget.
 */
function hasTextFieldRole(input: HTMLInputElement): boolean {
  const role = roleOf(input);

  return !role || TEXT_FIELD_ROLES.includes(role);
}

/**
 * The role an element is given: the first token of its `role` attribute, which is a list of
 * tokens. WAI-ARIA would skip a token that names no role and read the next one; here an unknown
 * first token is the role, so a field that carries one keeps its keys.
 */
function roleOf(element: Element): string | undefined {
  return (element.getAttribute('role') ?? '')
    .split(HTML_TOKEN_SEPARATOR)
    .find(token => token !== '');
}

function hasModifier({ altKey, ctrlKey, metaKey, shiftKey }: KeyboardEvent): boolean {
  return altKey || ctrlKey || metaKey || shiftKey;
}

/**
 * Safari reports the Enter that commits a composition as `Enter` after the composition has ended,
 * with only the key code left to tell it from an Enter of its own.
 */
function isPartOfComposition({ isComposing, keyCode }: KeyboardEvent): boolean {
  return isComposing || keyCode === 229;
}
