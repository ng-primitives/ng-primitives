import { afterNextRender } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, listener, onDestroy } from 'ng-primitives/state';
import { injectTreeNodeState } from '../tree-node/tree-node-state';

/**
 * The state for the NgpTreeNodeRename directive - placed on the `<input>` a
 * consumer renders while a node is being renamed. It focuses and selects the
 * field, commits on Enter / blur, cancels on Escape, and stops its own pointer
 * and key events from reaching the row (so editing never drags, selects, or
 * triggers type-ahead).
 */
export interface NgpTreeNodeRenameState {}

export interface NgpTreeNodeRenameProps {}

export const [
  NgpTreeNodeRenameStateToken,
  ngpTreeNodeRename,
  injectTreeNodeRenameState,
  provideTreeNodeRenameState,
] = createPrimitive('NgpTreeNodeRename', (): NgpTreeNodeRenameState => {
  const element = injectElementRef<HTMLInputElement>();
  const node = injectTreeNodeState();

  // Register the field so the row can focus it inside the touch gesture (iOS
  // keyboard) without a DOM query, and treat it as an interactive part.
  onDestroy(node().registerRenameElement(element.nativeElement));

  // Focus + select the field once it renders so the user can type immediately.
  afterNextRender(() => {
    element.nativeElement.focus();
    element.nativeElement.select?.();
  });

  listener(element, 'keydown', (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      node().commitRename(element.nativeElement.value);
      node().focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      node().cancelRename();
      node().focus();
    } else {
      // Keep typing (incl. Space) inside the field - don't let it bubble to the
      // row's keydown (type-ahead / selection / navigation).
      event.stopPropagation();
    }
  });

  // Committing on blur handles clicking away.
  listener(element, 'blur', () => node().commitRename(element.nativeElement.value));

  // Interacting with the field must not reach the row (drag / select / re-open).
  listener(element, 'pointerdown', (event: Event) => event.stopPropagation());
  listener(element, 'click', (event: Event) => event.stopPropagation());
  listener(element, 'dblclick', (event: Event) => event.stopPropagation());

  return {} satisfies NgpTreeNodeRenameState;
});
