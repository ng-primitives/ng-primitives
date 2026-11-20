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
  // the composed path reaches into shadow trees, so a field inside a web component still counts
  const target = event.composedPath()[0];

  if (target instanceof Element && !isField(target)) {
    event.preventDefault();
  }
}

function isField(element: Element): boolean {
  return (
    (element instanceof HTMLElement && element.isContentEditable) ||
    element.closest(FIELD_SELECTOR) !== null
  );
}
