import { Directive, input } from '@angular/core';
import { provideRovingFocusItemState } from 'ng-primitives/roving-focus';
import { ngpTreeNode, provideTreeNodeState } from './tree-node-state';

/**
 * A single tree node, placed on each row element rendered from
 * `tree.visibleNodes()`. It becomes the `treeitem` and derives its level,
 * position and expansion from the surrounding `[ngpTree]`, exposing them so the
 * consumer can style/branch on them.
 *
 * The node is intentionally non-generic: the consumer's data type comes from
 * `tree.visibleNodes()`, and the node only needs the node value to look up its
 * own metadata. Everything it exposes (`value`, `level`, `expanded`, ...) is
 * independent of the node's shape.
 */
@Directive({
  selector: '[ngpTreeNode]',
  exportAs: 'ngpTreeNode',
  providers: [provideTreeNodeState(), provideRovingFocusItemState()],
})
export class NgpTreeNode {
  /** The node's data object. */
  readonly data = input.required<unknown>({ alias: 'ngpTreeNode' });

  protected readonly state = ngpTreeNode({ data: this.data });

  /** The stable string identity of this node. */
  readonly value = this.state.value;

  /** The 1-based depth of this node (root nodes are level 1). */
  readonly level = this.state.level;

  /** The number of siblings (including this node) in its group. */
  readonly setsize = this.state.setsize;

  /** The 1-based position of this node within its sibling group. */
  readonly posinset = this.state.posinset;

  /** Whether this node can be expanded. */
  readonly expandable = this.state.expandable;

  /** Whether this node is currently expanded. */
  readonly expanded = this.state.expanded;

  /** Whether this node is disabled. */
  readonly disabled = this.state.disabled;

  /** Whether this node is currently selected. */
  readonly selected = this.state.selected;

  /** Whether this node's checkbox is fully checked. */
  readonly checked = this.state.checked;

  /** Whether this node's checkbox is partially checked. */
  readonly indeterminate = this.state.indeterminate;

  /** Whether this node's children are currently being lazily loaded. */
  readonly loading = this.state.loading;

  /** Whether this node's last lazy load failed (cleared on retry/success). */
  readonly loadError = this.state.loadError;

  /** Whether this node is currently being dragged. */
  readonly dragging = this.state.dragging;

  /** The drop position if this node is the current drop target, else `null`. */
  readonly dropPosition = this.state.dropPosition;

  /** Whether this node is currently being renamed. */
  readonly renaming = this.state.renaming;

  /** Whether this node can be renamed. */
  readonly renamable = this.state.renamable;

  /** Whether this node is marked for a cut/paste move. */
  readonly cut = this.state.cut;

  /** Whether this node matches the current search query. */
  readonly matched = this.state.matched;

  /** Expand this node. */
  expand(): void {
    this.state.expand();
  }

  /** Collapse this node. */
  collapse(): void {
    this.state.collapse();
  }

  /** Toggle this node's expansion. */
  toggle(): void {
    this.state.toggle();
  }

  /** Select this node. */
  select(): void {
    this.state.select();
  }

  /** Toggle this node's selection. */
  toggleSelected(): void {
    this.state.toggleSelected();
  }

  /** Toggle this node's checkbox. */
  toggleChecked(): void {
    this.state.toggleChecked();
  }

  /** Begin renaming this node. */
  startRename(): void {
    this.state.startRename();
  }

  /** Commit the in-progress rename with the entered label. */
  commitRename(label: string): void {
    this.state.commitRename(label);
  }

  /** Cancel the in-progress rename. */
  cancelRename(): void {
    this.state.cancelRename();
  }

  /** Retry this node's failed lazy load in place. */
  reload(): void {
    this.state.reload();
  }
}
