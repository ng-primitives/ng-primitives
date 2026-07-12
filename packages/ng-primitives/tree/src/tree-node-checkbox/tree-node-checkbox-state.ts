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
 * `mixed` (indeterminate) when only some descendants are checked.
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
  // for selection-less checkbox trees).
  onDestroy(node().registerCheckbox());

  const ariaChecked = () =>
    node().indeterminate() ? 'mixed' : node().checked() ? 'true' : 'false';

  // Host bindings.
  attrBinding(element, 'role', () => (tagName === 'input' ? null : 'checkbox'));
  attrBinding(element, 'type', () => (tagName === 'button' ? 'button' : null));
  attrBinding(element, 'tabindex', '-1');
  attrBinding(element, 'aria-checked', ariaChecked);
  attrBinding(element, 'disabled', () => (tagName === 'button' && node().disabled() ? '' : null));
  attrBinding(element, 'aria-disabled', () => (node().disabled() ? 'true' : null));
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
