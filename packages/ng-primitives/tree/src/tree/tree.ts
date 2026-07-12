import { computed, Directive, input, output, Signal } from '@angular/core';
import { provideRovingFocusGroupState } from 'ng-primitives/roving-focus';
import {
  NgpTreeAccessors,
  ngpTree,
  NgpTreeCheckboxBehavior,
  NgpTreeDisabledBehavior,
  NgpTreeDropEvent,
  NgpTreeRenameEvent,
  NgpTreeSelectionBehavior,
  NgpTreeSelectionMode,
  provideTreeState,
} from './tree-state';

/**
 * The root of a tree. Renders nothing itself - the consumer iterates
 * `visibleNodes()` with a single `@for` (or `*cdkVirtualFor`) and places an
 * `ngpTreeNode` on each row. Hierarchy comes from the `ngpTreeNodes` data +
 * accessors.
 */
@Directive({
  selector: '[ngpTree]',
  exportAs: 'ngpTree',
  providers: [provideTreeState(), provideRovingFocusGroupState()],
})
export class NgpTree<T = unknown> {
  /** The root nodes of the tree. */
  readonly nodes = input.required<readonly T[]>({ alias: 'ngpTreeNodes' });

  /** How to read the children of a node. */
  readonly childrenAccessor = input.required<(node: T) => readonly T[] | undefined>({
    alias: 'ngpTreeItemChildren',
  });

  /** How to read the stable string identity of a node. */
  readonly itemValue = input.required<(node: T) => string>({ alias: 'ngpTreeItemValue' });

  /** Whether a node can be expanded. Defaults to "has children". */
  readonly isExpandable = input<((node: T) => boolean) | undefined>(undefined, {
    alias: 'ngpTreeItemExpandable',
  });

  /** Whether a node is disabled. */
  readonly itemDisabled = input<((node: T) => boolean) | undefined>(undefined, {
    alias: 'ngpTreeItemDisabled',
  });

  /** The text used for type-ahead matching (defaults to the row's text content). */
  readonly itemLabel = input<((node: T) => string) | undefined>(undefined, {
    alias: 'ngpTreeItemLabel',
  });

  /** Lazily load a node's children the first time it is expanded. */
  readonly loadChildren = input<((node: T) => Promise<readonly T[]>) | undefined>(undefined, {
    alias: 'ngpTreeItemLoadChildren',
  });

  /** Enables drag & drop: `true` (all draggable) or a per-node predicate. */
  readonly itemDraggable = input<boolean | ((node: T) => boolean) | undefined>(undefined, {
    alias: 'ngpTreeItemDraggable',
  });

  /** Whether a drop is allowed (drops onto a node's own subtree are always blocked). */
  readonly canDrop = input<((event: NgpTreeDropEvent<T>) => boolean) | undefined>(undefined, {
    alias: 'ngpTreeCanDrop',
  });

  /** Emits when a node is dropped - move the node(s) in your data here. */
  readonly drop = output<NgpTreeDropEvent<T>>({ alias: 'ngpTreeDrop' });

  /** Enables inline rename: `true` (all renamable) or a per-node predicate. */
  readonly itemRenamable = input<boolean | ((node: T) => boolean) | undefined>(undefined, {
    alias: 'ngpTreeItemRenamable',
  });

  /** Emits when a rename is committed - update the node's label in your data here. */
  readonly rename = output<NgpTreeRenameEvent<T>>({ alias: 'ngpTreeRename' });

  /** A search query. When non-empty, filters the tree to matches and their ancestors. */
  readonly search = input<string | undefined>(undefined, { alias: 'ngpTreeQuery' });

  /** How to match a node against the query. Defaults to a case-insensitive label match. */
  readonly itemMatch = input<((node: T, query: string) => boolean) | undefined>(undefined, {
    alias: 'ngpTreeItemMatch',
  });

  /** Emits when a node is activated - Enter, or a double-click when it isn't renamable. */
  readonly activate = output<T>({ alias: 'ngpTreeActivate' });

  /** The set of expanded node values (two-way bindable). */
  readonly expandedKeys = input<ReadonlySet<string> | undefined>(undefined, {
    alias: 'ngpTreeExpandedKeys',
  });

  /** The initial expanded set for uncontrolled usage. */
  readonly defaultExpandedKeys = input<ReadonlySet<string>>(new Set(), {
    alias: 'ngpTreeDefaultExpandedKeys',
  });

  /** Emits when the expanded set changes (enables `[(ngpTreeExpandedKeys)]`). */
  readonly expandedKeysChange = output<ReadonlySet<string>>({
    alias: 'ngpTreeExpandedKeysChange',
  });

  /** The selection mode: `none` (default), `single`, or `multiple`. */
  readonly selectionMode = input<NgpTreeSelectionMode>('none', {
    alias: 'ngpTreeSelectionMode',
  });

  /** Whether interactions toggle or replace the selection. */
  readonly selectionBehavior = input<NgpTreeSelectionBehavior>('toggle', {
    alias: 'ngpTreeSelectionBehavior',
  });

  /** How disabled nodes behave: `all` (inert) or `selection` (focusable, unselectable). */
  readonly disabledBehavior = input<NgpTreeDisabledBehavior>('all', {
    alias: 'ngpTreeDisabledBehavior',
  });

  /** The set of selected node values (two-way bindable). */
  readonly selectedKeys = input<ReadonlySet<string> | undefined>(undefined, {
    alias: 'ngpTreeSelectedKeys',
  });

  /** The initial selected set for uncontrolled usage. */
  readonly defaultSelectedKeys = input<ReadonlySet<string>>(new Set(), {
    alias: 'ngpTreeDefaultSelectedKeys',
  });

  /** Emits when the selected set changes (enables `[(ngpTreeSelectedKeys)]`). */
  readonly selectedKeysChange = output<ReadonlySet<string>>({
    alias: 'ngpTreeSelectedKeysChange',
  });

  /** How checkboxes propagate: `cascade` (default) or `independent` (`checkStrictly`). */
  readonly checkboxBehavior = input<NgpTreeCheckboxBehavior>('cascade', {
    alias: 'ngpTreeCheckboxBehavior',
  });

  /** The set of checked leaf values (two-way bindable). */
  readonly checkedKeys = input<ReadonlySet<string> | undefined>(undefined, {
    alias: 'ngpTreeCheckedKeys',
  });

  /** The initial checked set for uncontrolled usage. */
  readonly defaultCheckedKeys = input<ReadonlySet<string>>(new Set(), {
    alias: 'ngpTreeDefaultCheckedKeys',
  });

  /** Emits when the checked set changes (enables `[(ngpTreeCheckedKeys)]`). */
  readonly checkedKeysChange = output<ReadonlySet<string>>({
    alias: 'ngpTreeCheckedKeysChange',
  });

  private readonly accessors = computed<NgpTreeAccessors<T>>(() => ({
    itemValue: this.itemValue(),
    childrenAccessor: this.childrenAccessor(),
    isExpandable: this.isExpandable(),
    itemDisabled: this.itemDisabled(),
    itemLabel: this.itemLabel(),
    loadChildren: this.loadChildren(),
  }));

  protected readonly state = ngpTree<T>({
    nodes: this.nodes,
    accessors: this.accessors,
    expandedKeys: this.expandedKeys,
    defaultExpandedKeys: this.defaultExpandedKeys,
    onExpandedChange: keys => this.expandedKeysChange.emit(keys),
    selectionMode: this.selectionMode,
    selectionBehavior: this.selectionBehavior,
    disabledBehavior: this.disabledBehavior,
    selectedKeys: this.selectedKeys,
    defaultSelectedKeys: this.defaultSelectedKeys,
    onSelectionChange: keys => this.selectedKeysChange.emit(keys),
    checkedKeys: this.checkedKeys,
    defaultCheckedKeys: this.defaultCheckedKeys,
    onCheckedChange: keys => this.checkedKeysChange.emit(keys),
    checkboxBehavior: this.checkboxBehavior,
    itemDraggable: this.itemDraggable,
    canDrop: this.canDrop,
    onDrop: event => this.drop.emit(event),
    itemRenamable: this.itemRenamable,
    onRename: event => this.rename.emit(event),
    search: this.search,
    itemMatch: this.itemMatch,
    onActivate: node => this.activate.emit(node),
  });

  /**
   * The flattened list of currently-visible nodes. Iterate with `@for` (or
   * `*cdkVirtualFor`) and place an `ngpTreeNode` on each row.
   */
  get visibleNodes(): Signal<readonly T[]> {
    return this.state.visibleNodes;
  }

  /** The stable string identity of a node (for `@for` `track`). */
  valueOf(node: T): string {
    return this.state.valueOf(node);
  }

  /** Expand every expandable node in the tree. */
  expandAll(): void {
    this.state.expandAll();
  }

  /** Collapse every node in the tree. */
  collapseAll(): void {
    this.state.collapseAll();
  }
}
