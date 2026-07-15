import { HOST_TAG_NAME, inject } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { injectTreeNodeState } from '../tree-node/tree-node-state';

/**
 * The state for the NgpTreeNodeCheckbox directive - a tri-state checkbox for a
 * tree node. Checking a parent checks all its leaf descendants; a parent is
 * `mixed` (indeterminate) when only some descendants are checked. The `treeitem`
 * row carries `aria-checked` (per the APG checkbox-tree pattern), so this element
 * is decorative for assistive tech - it is removed from the tab order and hidden
 * from AT, and exposes its state via `data-checked` / `data-indeterminate`.
 */
export interface NgpTreeNodeCheckboxState {}

export interface NgpTreeNodeCheckboxProps {}

export const [
  NgpTreeNodeCheckboxStateToken,
  ngpTreeNodeCheckbox,
  injectTreeNodeCheckboxState,
  provideTreeNodeCheckboxState,
] = createPrimitive('NgpTreeNodeCheckbox', (): NgpTreeNodeCheckboxState => {
  const element = injectElementRef<HTMLElement>();
  const tagName = inject(HOST_TAG_NAME);
  const node = injectTreeNodeState();

  // Tell the row a checkbox is present so Space toggles it (keyboard operability
  // for selection-less checkbox trees), and register this element so the row can
  // tell interactions with the checkbox apart from interactions with the row.
  onDestroy(node().registerCheckbox(element.nativeElement));

  // Host bindings. The row (`treeitem`) announces the checked state, so this
  // element is hidden from AT like the toggle.
  attrBinding(element, 'type', () => (tagName === 'button' ? 'button' : null));
  attrBinding(element, 'tabindex', '-1');
  attrBinding(element, 'aria-hidden', 'true');
  attrBinding(element, 'disabled', () => (tagName === 'button' && node().disabled() ? '' : null));
  dataBinding(element, 'data-checked', () => node().checked());
  dataBinding(element, 'data-indeterminate', () => node().indeterminate());
  dataBinding(element, 'data-disabled', () => node().disabled());

  // Event listeners.
  listener(element, 'click', onClick);

  function onClick(event: MouseEvent): void {
    // Checking must not also select or focus the row.
    event.stopPropagation();
    if (node().disabled()) {
      return;
    }
    node().toggleChecked();
  }

  return {} satisfies NgpTreeNodeCheckboxState;
});
