import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, listener, onDestroy } from 'ng-primitives/state';
import { injectTreeNodeState } from '../tree-node/tree-node-state';

/**
 * The state for the NgpTreeNodeDragHandle directive - restricts a node's drag
 * origin to this element instead of the whole row, so the rest of the row stays
 * usable for selection, links or inline controls.
 */
export interface NgpTreeNodeDragHandleState {}

export interface NgpTreeNodeDragHandleProps {}

export const [
  NgpTreeNodeDragHandleStateToken,
  ngpTreeNodeDragHandle,
  injectTreeNodeDragHandleState,
  provideTreeNodeDragHandleState,
] = createPrimitive('NgpTreeNodeDragHandle', (): NgpTreeNodeDragHandleState => {
  const element = injectElementRef<HTMLElement>();
  const node = injectTreeNodeState();

  // Tell the row a handle is present so its body no longer starts drags.
  onDestroy(node().registerDragHandle());

  // Begin the drag from the handle. A click on the handle shouldn't select the
  // row, so stop it from bubbling.
  listener(element, 'pointerdown', (event: PointerEvent) => node().startDrag(event));
  listener(element, 'click', (event: MouseEvent) => event.stopPropagation());

  return {} satisfies NgpTreeNodeDragHandleState;
});
