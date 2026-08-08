import { Directive } from '@angular/core';
import {
  ngpTreeNodeDragHandle,
  provideTreeNodeDragHandleState,
} from './tree-node-drag-handle-state';

/**
 * A dedicated drag handle for a tree node. Place it on a child of the row to
 * restrict where a drag can begin - the rest of the row is then free for
 * selection, links or inline controls. Requires `ngpTreeItemDraggable` on the tree.
 */
@Directive({
  selector: '[ngpTreeNodeDragHandle]',
  exportAs: 'ngpTreeNodeDragHandle',
  providers: [provideTreeNodeDragHandleState()],
})
export class NgpTreeNodeDragHandle {
  protected readonly state = ngpTreeNodeDragHandle();
}
