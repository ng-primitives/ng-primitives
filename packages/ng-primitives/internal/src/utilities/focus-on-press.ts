/**
 * Fields that need focus, or their own press, to work. Buttons, links, checkboxes and radios act on
 * the click alone.
 */
const FIELD_SELECTOR =
  'input:not([type="button"], [type="submit"], [type="reset"], [type="image"], [type="checkbox"], [type="radio"]), textarea, select';

/**
 * Keep focus where it is when a press inside a popup lands anywhere but a field. The control that
 * owns the popup closes it on blur, and Safari blurs it even on a press on a button.
 */
export function preventFocusLossOnPress(event: MouseEvent): void {
  // the composed path reaches into open shadow trees, so a field inside a web component with an
  // open shadow root still counts. A closed one hides its field, and the press is prevented.
  const target = event.composedPath()[0];

  if (target instanceof Element && !isFocusField(target)) {
    event.preventDefault();
  }
}

/** Whether the element is, or sits in, a field that needs focus and its own keys to work. */
export function isFocusField(element: Element): boolean {
  return (
    (element instanceof HTMLElement && element.isContentEditable) ||
    element.closest(FIELD_SELECTOR) !== null
  );
}
