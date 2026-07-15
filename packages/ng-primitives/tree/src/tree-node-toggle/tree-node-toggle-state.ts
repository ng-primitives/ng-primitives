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
import { injectTreeState } from '../tree/tree-state';

/**
 * The state for the NgpTreeNodeToggle directive - the chevron/expand control on a
 * node row. It is decorative for assistive tech (the `treeitem` itself carries
 * `aria-expanded`), so it is removed from the tab order and hidden from AT.
 */
export interface NgpTreeNodeToggleState {
  /** Toggle the owning node's expansion. */
  toggle(): void;
}

export interface NgpTreeNodeToggleProps {}

export const [
  NgpTreeNodeToggleStateToken,
  ngpTreeNodeToggle,
  injectTreeNodeToggleState,
  provideTreeNodeToggleState,
] = createPrimitive('NgpTreeNodeToggle', (): NgpTreeNodeToggleState => {
  const element = injectElementRef<HTMLElement>();
  const tagName = inject(HOST_TAG_NAME);
  const node = injectTreeNodeState();
  const tree = injectTreeState();

  // Register this element so the row can tell a click/tap on the toggle apart
  // from one on the row (a double-click on the chevron must not rename the row).
  onDestroy(node().registerInteractive(element.nativeElement));

  // Expansion is blocked only when the node is fully inert (`all` behavior); in
  // `selection` behavior a disabled node can still be expanded.
  const expandDisabled = () => node().disabled() && tree().disabledBehavior() === 'all';

  // Host bindings.
  attrBinding(element, 'type', () => (tagName === 'button' ? 'button' : null));
  attrBinding(element, 'tabindex', '-1');
  attrBinding(element, 'aria-hidden', 'true');
  // A fully-inert node's toggle is disabled too.
  attrBinding(element, 'disabled', () => (tagName === 'button' && expandDisabled() ? '' : null));
  dataBinding(element, 'data-expanded', () => node().expanded());
  dataBinding(element, 'data-expandable', () => node().expandable());
  dataBinding(element, 'data-disabled', () => node().disabled());

  // Event listeners.
  listener(element, 'click', onClick);

  function onClick(event: MouseEvent): void {
    // Toggling expansion must not also select the row.
    event.stopPropagation();
    if (expandDisabled()) {
      return;
    }
    node().toggle();
  }

  return {
    toggle: () => node().toggle(),
  } satisfies NgpTreeNodeToggleState;
});
