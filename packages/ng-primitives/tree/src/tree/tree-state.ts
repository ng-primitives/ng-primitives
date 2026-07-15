import { DOCUMENT } from '@angular/common';
import {
  computed,
  effect,
  EmbeddedViewRef,
  inject,
  NgZone,
  signal,
  Signal,
  TemplateRef,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpRovingFocusGroup } from 'ng-primitives/roving-focus';
import {
  attrBinding,
  controlledState,
  createPrimitive,
  dataBinding,
  onDestroy,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';

/**
 * Accessor functions describing how to read an opaque tree node of type `T`. The
 * tree never assumes a shape for a node; identity, children and expandability are
 * all derived through these.
 */
export interface NgpTreeAccessors<T> {
  /** The stable string identity of a node. Keys expansion/selection/checked state. */
  readonly itemValue: (node: T) => string;
  /** The children of a node, or `undefined`/`[]` for a leaf. */
  readonly itemChildren: (node: T) => readonly T[] | undefined;
  /**
   * Whether a node can be expanded. Defaults to "has children". Override to show a
   * chevron before children are loaded (async), i.e. `itemExpandable` is `true` while
   * `itemChildren` still returns `undefined`.
   */
  readonly itemExpandable?: (node: T) => boolean;
  /** Whether a node is disabled. */
  readonly itemDisabled?: (node: T) => boolean;
  /**
   * The text used for type-ahead matching. Defaults to the row's text content, so
   * only provide it when the row has chrome (icons, badges) that would pollute the
   * match.
   */
  readonly itemLabel?: (node: T) => string;
  /**
   * Lazily load a node's children the first time it is expanded. Pair with
   * `itemExpandable` returning `true` so the chevron shows before children exist.
   */
  readonly itemLoadChildren?: (node: T) => Promise<readonly T[]>;
}

/** Per-node hierarchy metadata, derived from the full node tree. */
interface NgpTreeNodeMeta<T> {
  readonly data: T;
  readonly level: number;
  readonly parent: string | null;
  readonly posinset: number;
  readonly setsize: number;
}

/** How many nodes may be selected at once. */
export type NgpTreeSelectionMode = 'none' | 'single' | 'multiple';

/**
 * How disabled nodes behave: `all` (default) makes them fully inert (no focus,
 * expand or select); `selection` keeps them focusable and expandable but not
 * selectable/checkable.
 */
export type NgpTreeDisabledBehavior = 'all' | 'selection';

/**
 * Whether a plain interaction toggles a node's selection or replaces the whole
 * selection (modifiers still toggle/range in `replace` mode).
 */
export type NgpTreeSelectionBehavior = 'toggle' | 'replace';

/**
 * How checkboxes propagate: `cascade` (default) checks a node's leaf descendants
 * and rolls parents up to checked/indeterminate; `independent` checks only the
 * node itself, with no cascade and no indeterminate state (`checkStrictly`).
 */
export type NgpTreeCheckboxBehavior = 'cascade' | 'independent';

/** Where a dragged node would land relative to the drop target. */
export type NgpTreeDropPosition = 'before' | 'inside' | 'after';

/**
 * Whether a drop moves the node(s) or copies them. `copy` when the platform
 * copy modifier (Alt/Option) is held at drop time, otherwise `move`.
 */
export type NgpTreeDropEffect = 'move' | 'copy';

/** The payload for `(ngpTreeRename)` - a node and the new label the user entered. */
export interface NgpTreeRenameEvent<T> {
  /** The node being renamed. */
  readonly node: T;
  /** The new (trimmed, non-empty) label the user committed. */
  readonly value: string;
}

/** The payload for `ngpTreeCanDrop` / `(ngpTreeDrop)`. */
export interface NgpTreeDropEvent<T> {
  /**
   * The node(s) being moved, in visible order. A single-node drag has one
   * entry; dragging a node that's part of the selection moves the whole
   * selection (top-most nodes only). Also used for a keyboard cut/paste move.
   */
  readonly sources: readonly T[];
  /** The node it is being dropped on, or `null` when dropped onto the tree root. */
  readonly target: T | null;
  /** Where relative to the target it would land (`inside` for a root drop). */
  readonly position: NgpTreeDropPosition;
  /** Whether the drop is a move (default) or a copy (Alt/Option held). */
  readonly effect: NgpTreeDropEffect;
}

/** Modifiers describing how a selection interaction should behave. */
export interface NgpTreeSelectOptions {
  /** Toggle the node in/out of the selection (Ctrl/Cmd-click, Space). */
  readonly toggle?: boolean;
  /** Extend the selection as a contiguous range from the anchor (Shift-click). */
  readonly range?: boolean;
}

/**
 * The state for the NgpTree directive.
 */
export interface NgpTreeState<T> {
  /** The unique id for the tree. */
  readonly id: Signal<string>;
  /** The root nodes. */
  readonly nodes: Signal<readonly T[]>;
  /** The set of expanded node values. */
  readonly expandedKeys: Signal<ReadonlySet<string>>;
  /**
   * The flattened list of currently-visible nodes (roots + expanded descendants,
   * in order). Render this with a single `@for` (or `*cdkVirtualFor`).
   */
  readonly visibleNodes: Signal<readonly T[]>;
  /** The selection mode. */
  readonly selectionMode: Signal<NgpTreeSelectionMode>;
  /** How disabled nodes behave (`all` = inert, `selection` = focusable but unselectable). */
  readonly disabledBehavior: Signal<NgpTreeDisabledBehavior>;
  /** The set of selected node values. */
  readonly selectedKeys: Signal<ReadonlySet<string>>;
  /** The set of checked leaf values (parents derive their state from these). */
  readonly checkedKeys: Signal<ReadonlySet<string>>;

  /** The stable identity of a node. */
  keyOf(node: T): string;
  /** Whether a node value is currently expanded. */
  isExpanded(value: string): boolean;
  /** Whether a node's children are currently being lazily loaded. */
  isLoading(value: string): boolean;
  /** Whether a node's last lazy load failed (cleared on retry/success). */
  isLoadError(value: string): boolean;
  /** @internal Retry a failed (or refresh a) lazy load for a node. */
  reload(value: string): void;
  /** Expand a node. */
  expand(value: string): void;
  /** Collapse a node. */
  collapse(value: string): void;
  /** Toggle a node's expansion. */
  toggle(value: string): void;
  /** @internal Expand every expandable sibling at a node's level (the `*` key). */
  expandSiblings(value: string): void;
  /** Expand every expandable node in the tree. */
  expandAll(): void;
  /** Collapse every node in the tree. */
  collapseAll(): void;
  /** Whether a node value is currently selected. */
  isSelected(value: string): boolean;
  /** Select all currently-visible (non-disabled) nodes. */
  selectAll(): void;
  /** Clear the selection. */
  clearSelection(): void;
  /** Whether a node is fully checked (all its leaf descendants are checked). */
  isChecked(value: string): boolean;
  /** Whether a node is partially checked (some but not all leaves checked). */
  isIndeterminate(value: string): boolean;
  /** Toggle a node's checkbox, propagating to its leaf descendants. */
  toggleChecked(value: string): void;

  /** @internal Register a custom drag-preview template (from `ngpTreeDragPreview`). */
  registerDragPreview(template: TemplateRef<{ $implicit: T }> | null): void;

  /** Whether a node is currently being dragged. */
  isDragging(value: string): boolean;
  /** The drop position for a node if it is the current drop target, else `null`. */
  dropPositionOf(value: string): NgpTreeDropPosition | null;
  /** Whether a node is currently marked for a cut/paste move. */
  isCut(value: string): boolean;
  /** @internal Mark a node (or the selection) for a cut/paste move. */
  cut(value: string): void;
  /** @internal Paste the cut node(s) onto a node (inside a folder, else after). */
  paste(value: string): void;
  /** @internal Clear any pending cut. */
  clearCut(): void;

  /** Whether a node matches the current search query. */
  isMatched(value: string): boolean;

  /** Whether a node value is currently being renamed. */
  isRenaming(value: string): boolean;
  /** @internal Whether renaming is enabled for a node (via `itemRenamable`). */
  canRenameValue(value: string): boolean;
  /** @internal Begin renaming a node (no-op if renaming isn't enabled for it). */
  startRename(value: string): void;
  /** @internal Commit a rename with the entered label (empty/unchanged = cancel). */
  commitRename(value: string, label: string): void;
  /** @internal Cancel the in-progress rename. */
  cancelRename(): void;

  /** @internal Activate a node (Enter, or double-click when not renaming). */
  activate(value: string): void;
  /** @internal Apply a selection interaction (click / keyboard) for a node value. */
  selectNode(value: string, options?: NgpTreeSelectOptions): void;
  /** @internal Begin a pointer drag from a node (called on pointerdown). */
  beginDrag(value: string, event: PointerEvent): void;

  /** @internal The children of a node (never `undefined`). */
  childrenOf(node: T): readonly T[];
  /** @internal Whether a node can be expanded. */
  isExpandable(node: T): boolean;
  /** @internal Whether a node is disabled. */
  isDisabled(node: T): boolean;
  /** @internal The 1-based depth of a node value (root nodes are level 1). */
  level(value: string): number;
  /** @internal The number of siblings (including this node) in the node's group. */
  setsize(value: string): number;
  /** @internal The 1-based position of a node value within its sibling group. */
  posinset(value: string): number;
  /** @internal The value of a node's parent, or `undefined` for a root node. */
  parentValueOf(value: string): string | undefined;
  /** @internal The value of a node's first child, or `undefined` if it has none. */
  firstChildValueOf(value: string): string | undefined;
  /** @internal Move roving focus to a node value (if it is currently visible). */
  focusValue(value: string): void;
  /** @internal Handle a type-ahead character, moving focus to the next match. */
  onTypeahead(char: string): void;

  /** @internal Register a rendered node so it can receive roving focus by value. */
  registerNode(value: string, rovingItemId: string, element: HTMLElement): void;
  /** @internal Unregister a node when its row is destroyed. */
  unregisterNode(value: string): void;
}

/**
 * The props for the NgpTree state.
 */
export interface NgpTreeProps<T> {
  /** The root nodes. */
  readonly nodes: Signal<readonly T[]>;
  /** The accessors describing the node shape. */
  readonly accessors: Signal<NgpTreeAccessors<T>>;
  /** The set of expanded node values (controlled; `undefined` = uncontrolled). */
  readonly expandedKeys?: Signal<ReadonlySet<string> | undefined>;
  /** The initial expanded set for uncontrolled usage. */
  readonly defaultExpandedKeys?: Signal<ReadonlySet<string>>;
  /** Callback when the expanded set changes. */
  readonly onExpandedChange?: (keys: ReadonlySet<string>) => void;

  /** The selection mode. */
  readonly selectionMode?: Signal<NgpTreeSelectionMode>;
  /** Whether interactions toggle or replace the selection. */
  readonly selectionBehavior?: Signal<NgpTreeSelectionBehavior>;
  /** How disabled nodes behave. */
  readonly disabledBehavior?: Signal<NgpTreeDisabledBehavior>;
  /** The set of selected node values (controlled; `undefined` = uncontrolled). */
  readonly selectedKeys?: Signal<ReadonlySet<string> | undefined>;
  /** The initial selected set for uncontrolled usage. */
  readonly defaultSelectedKeys?: Signal<ReadonlySet<string>>;
  /** Callback when the selected set changes. */
  readonly onSelectionChange?: (keys: ReadonlySet<string>) => void;

  /** The set of checked leaf values (controlled; `undefined` = uncontrolled). */
  readonly checkedKeys?: Signal<ReadonlySet<string> | undefined>;
  /** The initial checked set for uncontrolled usage. */
  readonly defaultCheckedKeys?: Signal<ReadonlySet<string>>;
  /** Callback when the checked set changes. */
  readonly onCheckedChange?: (keys: ReadonlySet<string>) => void;
  /** How checkboxes propagate (`cascade` default, or `independent`). */
  readonly checkboxBehavior?: Signal<NgpTreeCheckboxBehavior>;

  /** Enables drag & drop: `true`/predicate marks nodes draggable, `undefined` = off. */
  readonly itemDraggable?: Signal<boolean | ((node: T) => boolean) | undefined>;
  /** Whether a drop is allowed. Defaults to blocking drops onto a node's own subtree. */
  readonly canDrop?: Signal<((event: NgpTreeDropEvent<T>) => boolean) | undefined>;
  /** Called when a node is dropped. Move the node in your data here. */
  readonly onDrop?: (event: NgpTreeDropEvent<T>) => void;

  /** Enables rename: `true`/predicate marks nodes renamable, `undefined` = off. */
  readonly itemRenamable?: Signal<boolean | ((node: T) => boolean) | undefined>;
  /** Called when a rename is committed. Update the node's label in your data here. */
  readonly onRename?: (event: NgpTreeRenameEvent<T>) => void;

  /** A search query. When non-empty, filters the tree to matches + their ancestors. */
  readonly query?: Signal<string | undefined>;
  /** How to test a node against the query. Defaults to a case-insensitive label match. */
  readonly itemMatch?: Signal<((node: T, query: string) => boolean) | undefined>;

  /** Called when a node is activated (Enter, or double-click when not renaming). */
  readonly onActivate?: (node: T) => void;
}

export const [NgpTreeStateToken, ngpTree, _injectTreeState, provideTreeState] = createPrimitive(
  'NgpTree',
  <T>({
    nodes,
    accessors,
    expandedKeys: _expandedKeys = signal<ReadonlySet<string> | undefined>(undefined),
    defaultExpandedKeys = signal<ReadonlySet<string>>(new Set()),
    onExpandedChange,
    selectionMode = signal<NgpTreeSelectionMode>('none'),
    selectionBehavior = signal<NgpTreeSelectionBehavior>('toggle'),
    disabledBehavior = signal<NgpTreeDisabledBehavior>('all'),
    selectedKeys: _selectedKeys = signal<ReadonlySet<string> | undefined>(undefined),
    defaultSelectedKeys = signal<ReadonlySet<string>>(new Set()),
    onSelectionChange,
    checkedKeys: _checkedKeys = signal<ReadonlySet<string> | undefined>(undefined),
    defaultCheckedKeys = signal<ReadonlySet<string>>(new Set()),
    onCheckedChange,
    checkboxBehavior = signal<NgpTreeCheckboxBehavior>('cascade'),
    itemDraggable = signal<boolean | ((node: T) => boolean) | undefined>(undefined),
    canDrop = signal(undefined),
    onDrop,
    itemRenamable = signal<boolean | ((node: T) => boolean) | undefined>(undefined),
    onRename,
    query = signal<string | undefined>(undefined),
    itemMatch = signal(undefined),
    onActivate,
  }: NgpTreeProps<T>): NgpTreeState<T> => {
    const element = injectElementRef<HTMLElement>();
    const document = inject(DOCUMENT);
    const viewContainerRef = inject(ViewContainerRef);
    const ngZone = inject(NgZone);
    const id = signal(uniqueId('ngp-tree'));

    // Vertical roving focus over the flat visible rows; wrap off per APG.
    const roving = ngpRovingFocusGroup({
      orientation: signal('vertical'),
      wrap: signal(false),
      homeEnd: signal(true),
    });

    // value -> { roving item id, element }, for focusing / type-ahead by value.
    const registry = new Map<string, { rovingId: string; element: HTMLElement }>();

    // Controlled/uncontrolled expansion state.
    const [expandedKeys, setExpandedKeys] = controlledState<ReadonlySet<string>>({
      value: _expandedKeys,
      defaultValue: defaultExpandedKeys,
      onChange: onExpandedChange,
    });

    // Controlled/uncontrolled selection state.
    const [selectedKeys, setSelectedKeys] = controlledState<ReadonlySet<string>>({
      value: _selectedKeys,
      defaultValue: defaultSelectedKeys,
      onChange: onSelectionChange,
    });

    // Controlled/uncontrolled checkbox state (stores checked leaf values).
    const [checkedKeys, setCheckedKeys] = controlledState<ReadonlySet<string>>({
      value: _checkedKeys,
      defaultValue: defaultCheckedKeys,
      onChange: onCheckedChange,
    });

    // Lazily-loaded children keyed by node value, and the in-flight load set.
    const loadedChildren = signal(new Map<string, readonly T[]>());
    const loadingKeys = signal<ReadonlySet<string>>(new Set());
    // Nodes whose most recent lazy load rejected (cleared on retry/success).
    const errorKeys = signal<ReadonlySet<string>>(new Set());

    // Anchor for range (Shift) selection.
    let selectionAnchor: string | undefined;

    // Host bindings.
    attrBinding(element, 'role', 'tree');
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-multiselectable', () =>
      selectionMode() === 'multiple' ? 'true' : null,
    );
    // Applied while a drag would drop at the tree root (over empty space).
    dataBinding(element, 'data-root-drop', () => dragState()?.root ?? false);

    function keyOf(node: T): string {
      return accessors().itemValue(node);
    }

    function childrenOf(node: T): readonly T[] {
      const explicit = accessors().itemChildren(node);
      if (explicit && explicit.length > 0) {
        return explicit;
      }
      // Fall back to lazily-loaded children.
      return loadedChildren().get(keyOf(node)) ?? explicit ?? [];
    }

    function isLoading(value: string): boolean {
      return loadingKeys().has(value);
    }

    function isLoadError(value: string): boolean {
      return errorKeys().has(value);
    }

    function clearError(value: string): void {
      if (errorKeys().has(value)) {
        const next = new Set(errorKeys());
        next.delete(value);
        errorKeys.set(next);
      }
    }

    async function loadNodeChildren(value: string): Promise<void> {
      const load = accessors().itemLoadChildren;
      const node = metaByValue().get(value)?.data;
      if (!load || !node) {
        return;
      }
      // Load once; ignore if already loaded or in flight.
      if (loadedChildren().has(value) || loadingKeys().has(value)) {
        return;
      }
      // Starting a (re)load clears any prior error for this node.
      clearError(value);
      loadingKeys.set(new Set(loadingKeys()).add(value));
      try {
        const children = await load(node);
        loadedChildren.set(new Map(loadedChildren()).set(value, children));
      } catch (error) {
        // Surface the failure as an error state the consumer can render (with a
        // retry via `reload`), and log for dev visibility. Leaving the node
        // un-loaded means expanding again also retries.
        errorKeys.set(new Set(errorKeys()).add(value));
        console.error('[ngpTree] loadChildren failed', error);
      } finally {
        const next = new Set(loadingKeys());
        next.delete(value);
        loadingKeys.set(next);
      }
    }

    // Retry a failed load in place (e.g. from a "retry" button in the row).
    function reload(value: string): void {
      clearError(value);
      void loadNodeChildren(value);
    }

    function isExpandable(node: T): boolean {
      const { itemExpandable: fn } = accessors();
      return fn ? fn(node) : childrenOf(node).length > 0;
    }

    function isDisabled(node: T): boolean {
      return accessors().itemDisabled?.(node) ?? false;
    }

    function isExpanded(value: string): boolean {
      const searching = searchState();
      // While searching, a folder that reveals matching descendants reads as
      // expanded (its children are shown regardless of the expanded set).
      if (searching) {
        const node = metaByValue().get(value)?.data;
        if (node && childrenOf(node).some(child => searching.visible.has(keyOf(child)))) {
          return true;
        }
      }
      return expandedKeys().has(value);
    }

    // Per-node hierarchy metadata, walked from the full tree.
    const metaByValue = computed(() => {
      const map = new Map<string, NgpTreeNodeMeta<T>>();
      const walk = (siblings: readonly T[], level: number, parent: string | null) => {
        siblings.forEach((node, index) => {
          map.set(keyOf(node), {
            data: node,
            level,
            parent,
            posinset: index + 1,
            setsize: siblings.length,
          });
          walk(childrenOf(node), level + 1, keyOf(node));
        });
      };
      walk(nodes(), 1, null);
      return map;
    });

    // The flattened list of visible nodes (DFS pre-order, gated by expansion).
    // When a search query is active, the set of nodes that match plus every
    // ancestor of a match (so matches stay in their hierarchy). `null` when the
    // query is empty.
    const searchState = computed<{ matched: Set<string>; visible: Set<string> } | null>(() => {
      const currentQuery = (query() ?? '').trim();
      if (!currentQuery) {
        return null;
      }
      const fn = itemMatch();
      const test = fn
        ? (node: T) => fn(node, currentQuery)
        : (node: T) => labelOf(node).toLowerCase().includes(currentQuery.toLowerCase());

      const matched = new Set<string>();
      const visible = new Set<string>();
      const walk = (siblings: readonly T[], ancestors: string[]): boolean => {
        let anyMatch = false;
        for (const node of siblings) {
          const value = keyOf(node);
          const selfMatch = test(node);
          const childMatch = walk(childrenOf(node), [...ancestors, value]);
          if (selfMatch) {
            matched.add(value);
          }
          if (selfMatch || childMatch) {
            visible.add(value);
            for (const ancestor of ancestors) {
              visible.add(ancestor);
            }
            anyMatch = true;
          }
        }
        return anyMatch;
      };
      walk(nodes(), []);
      return { matched, visible };
    });

    const visibleNodes = computed<readonly T[]>(() => {
      const searching = searchState();
      const expanded = expandedKeys();
      const result: T[] = [];
      const walk = (siblings: readonly T[]) => {
        for (const node of siblings) {
          const value = keyOf(node);
          // While searching, show only matches + ancestors, and reveal them all
          // regardless of the expanded set.
          if (searching && !searching.visible.has(value)) {
            continue;
          }
          result.push(node);
          if (searching || expanded.has(value)) {
            walk(childrenOf(node));
          }
        }
      };
      walk(nodes());
      return result;
    });

    function isMatched(value: string): boolean {
      return searchState()?.matched.has(value) ?? false;
    }

    function level(value: string): number {
      return metaByValue().get(value)?.level ?? 1;
    }

    function setsize(value: string): number {
      return metaByValue().get(value)?.setsize ?? 1;
    }

    function posinset(value: string): number {
      return metaByValue().get(value)?.posinset ?? 1;
    }

    function parentValueOf(value: string): string | undefined {
      return metaByValue().get(value)?.parent ?? undefined;
    }

    function firstChildValueOf(value: string): string | undefined {
      const node = metaByValue().get(value)?.data;
      if (!node) {
        return undefined;
      }
      const first = childrenOf(node)[0];
      return first ? keyOf(first) : undefined;
    }

    /** The value of the currently roving-focused node, if any. */
    function activeValue(): string | undefined {
      const active = roving.activeItem();
      for (const [value, entry] of registry) {
        if (entry.rovingId === active) {
          return value;
        }
      }
      return undefined;
    }

    /** Whether `value` is a descendant of `ancestor`. */
    function isDescendantOf(value: string, ancestor: string): boolean {
      let parent = parentValueOf(value);
      while (parent !== undefined) {
        if (parent === ancestor) {
          return true;
        }
        parent = parentValueOf(parent);
      }
      return false;
    }

    function setExpanded(value: string, expanded: boolean): void {
      const current = expandedKeys();
      if (current.has(value) === expanded) {
        return;
      }
      // Focus restoration: if a descendant is focused and we're collapsing it away,
      // move focus to the node being collapsed before its rows unmount.
      if (!expanded) {
        const active = activeValue();
        if (active && active !== value && isDescendantOf(active, value)) {
          focusValue(value);
        }
      }
      const next = new Set(current);
      if (expanded) {
        next.add(value);
      } else {
        next.delete(value);
      }
      // controlledState fires onExpandedChange for us.
      setExpandedKeys(next);

      // Lazily load children the first time a node is expanded.
      if (expanded) {
        void loadNodeChildren(value);
      }
    }

    // Expand every expandable sibling at a node's level (the APG `*` key). Roots
    // when the node has no parent, otherwise the parent's children.
    function expandSiblings(value: string): void {
      const parent = parentValueOf(value);
      const parentNode = parent === undefined ? undefined : metaByValue().get(parent)?.data;
      const siblings = parent === undefined ? nodes() : parentNode ? childrenOf(parentNode) : [];
      const current = expandedKeys();
      const next = new Set(current);
      const toLoad: string[] = [];
      for (const sibling of siblings) {
        if (isExpandable(sibling)) {
          const siblingValue = keyOf(sibling);
          if (!current.has(siblingValue)) {
            next.add(siblingValue);
            toLoad.push(siblingValue);
          }
        }
      }
      if (toLoad.length === 0) {
        return;
      }
      setExpandedKeys(next);
      for (const siblingValue of toLoad) {
        void loadNodeChildren(siblingValue);
      }
    }

    function focusValue(value: string): void {
      const entry = registry.get(value);
      if (entry) {
        roving.setActiveItem(entry.rovingId, 'keyboard');
        // Keep the focused row on screen (matters for long/scrollable trees).
        entry.element.scrollIntoView({ block: 'nearest' });
      }
    }

    // Expand every expandable node, kicking off any lazy loads for newly-opened
    // ones (mirrors `expandSiblings` but across the whole tree).
    function expandAll(): void {
      const current = expandedKeys();
      const next = new Set<string>();
      const toLoad: string[] = [];
      for (const [value, meta] of metaByValue()) {
        if (isExpandable(meta.data)) {
          next.add(value);
          if (!current.has(value)) {
            toLoad.push(value);
          }
        }
      }
      setExpandedKeys(next);
      for (const value of toLoad) {
        void loadNodeChildren(value);
      }
    }

    // Collapse everything. Keep focus on a still-visible row by moving it to the
    // active node's top-level ancestor first.
    function collapseAll(): void {
      const active = activeValue();
      if (active !== undefined) {
        let root = active;
        let parent = parentValueOf(root);
        while (parent !== undefined) {
          root = parent;
          parent = parentValueOf(root);
        }
        if (root !== active) {
          focusValue(root);
        }
      }
      setExpandedKeys(new Set());
    }

    function isSelectable(value: string): boolean {
      const node = metaByValue().get(value)?.data;
      return node !== undefined && !isDisabled(node);
    }

    function isSelected(value: string): boolean {
      return selectedKeys().has(value);
    }

    function selectRange(from: string, to: string): void {
      const values = visibleNodes().map(node => keyOf(node));
      const i = values.indexOf(from);
      const j = values.indexOf(to);
      if (i < 0 || j < 0) {
        return;
      }
      const [lo, hi] = i <= j ? [i, j] : [j, i];
      setSelectedKeys(new Set(values.slice(lo, hi + 1).filter(isSelectable)));
    }

    function activate(value: string): void {
      const node = metaByValue().get(value)?.data;
      if (node !== undefined) {
        onActivate?.(node);
      }
    }

    function selectNode(value: string, options: NgpTreeSelectOptions = {}): void {
      const mode = selectionMode();
      if (mode === 'none' || !isSelectable(value)) {
        return;
      }

      if (mode === 'single') {
        // A plain interaction always replaces; an explicit toggle (Ctrl/Cmd-click,
        // Space) can deselect the selected node.
        if (options.toggle && isSelected(value)) {
          setSelectedKeys(new Set());
        } else {
          setSelectedKeys(new Set([value]));
        }
        selectionAnchor = value;
        return;
      }

      // multiple
      if (options.range && selectionAnchor) {
        selectRange(selectionAnchor, value);
        return;
      }

      const toggle = options.toggle || selectionBehavior() === 'toggle';
      if (toggle) {
        const next = new Set(selectedKeys());
        if (next.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        setSelectedKeys(next);
      } else {
        setSelectedKeys(new Set([value]));
      }
      selectionAnchor = value;
    }

    // Select every visible node - not nodes hidden inside collapsed folders, so the
    // selection never contains rows the user can't see (and a subsequent drag,
    // which moves visible nodes, matches what Ctrl/Cmd+A selected).
    function selectAll(): void {
      if (selectionMode() === 'none') {
        return;
      }
      setSelectedKeys(new Set(visibleNodes().map(keyOf).filter(isSelectable)));
    }

    function clearSelection(): void {
      setSelectedKeys(new Set());
    }

    /** All leaf values in the subtree rooted at `value` (the node itself if a leaf). */
    function leafValuesOf(value: string): string[] {
      const node = metaByValue().get(value)?.data;
      if (!node) {
        return [];
      }
      const children = childrenOf(node);
      if (children.length === 0) {
        return [value];
      }
      return children.flatMap(child => leafValuesOf(keyOf(child)));
    }

    function isChecked(value: string): boolean {
      // Independent checkboxes store each node directly; no leaf roll-up.
      if (checkboxBehavior() === 'independent') {
        return checkedKeys().has(value);
      }
      const leaves = leafValuesOf(value);
      const checked = checkedKeys();
      return leaves.length > 0 && leaves.every(leaf => checked.has(leaf));
    }

    function isIndeterminate(value: string): boolean {
      // Independent checkboxes are never partial.
      if (checkboxBehavior() === 'independent') {
        return false;
      }
      const leaves = leafValuesOf(value);
      const checked = checkedKeys();
      const some = leaves.some(leaf => checked.has(leaf));
      return some && !leaves.every(leaf => checked.has(leaf));
    }

    function toggleChecked(value: string): void {
      // Independent: toggle only this node, no cascade.
      if (checkboxBehavior() === 'independent') {
        const next = new Set(checkedKeys());
        if (next.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        setCheckedKeys(next);
        return;
      }
      const leaves = leafValuesOf(value);
      if (leaves.length === 0) {
        return;
      }
      const current = checkedKeys();
      const fullyChecked = leaves.every(leaf => current.has(leaf));
      const next = new Set(current);
      for (const leaf of leaves) {
        if (fullyChecked) {
          next.delete(leaf);
        } else {
          next.add(leaf);
        }
      }
      setCheckedKeys(next);
    }

    // --- Drag & drop -------------------------------------------------------
    // `dragState` drives the drop indicators; `pending` holds the not-yet-past-
    // threshold press so a plain click never registers as a drag. `sources` are
    // all dragged values in visible order; `primary` is the grabbed row (drives
    // the preview position).
    const dragState = signal<{
      primary: string;
      sources: string[];
      over: string | null;
      position: NgpTreeDropPosition | null;
      // `root` is true when the drop would land at the tree root (over empty
      // space); `over` is null in that case too, so `root` disambiguates it from
      // "no valid target".
      root: boolean;
      effect: NgpTreeDropEffect;
    } | null>(null);
    let pending: {
      primary: string;
      sources: string[];
      x: number;
      y: number;
      touch: boolean;
    } | null = null;
    // A floating preview that mirrors the dragged row (a DOM clone by default,
    // or a consumer template registered via `ngpTreeDragPreview`).
    let dragPreviewTemplate: TemplateRef<{ $implicit: T; count: number }> | null = null;
    let previewEl: HTMLElement | null = null;
    let previewView: EmbeddedViewRef<{ $implicit: T; count: number }> | null = null;
    let grabOffset = { x: 0, y: 0 };
    // A drag is `armed` once it's allowed to start moving: immediately for a
    // mouse/pen, but only after a long-press for touch - so a normal touch-drag
    // scrolls the list instead of starting a drag.
    let armed = false;
    let longPressTimer: ReturnType<typeof setTimeout> | null = null;
    // "Spring-loaded" folders: hovering a collapsed folder during a drag
    // auto-expands it after a short delay.
    let springTarget: string | null = null;
    let springTimer: ReturnType<typeof setTimeout> | null = null;
    const DRAG_THRESHOLD = 5;
    const TOUCH_LONG_PRESS_MS = 500;
    const TOUCH_SLOP = 10;
    const SPRING_OPEN_MS = 800;

    function clearLongPress(): void {
      if (longPressTimer !== null) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }

    function clearSpring(): void {
      if (springTimer !== null) {
        clearTimeout(springTimer);
        springTimer = null;
      }
      springTarget = null;
    }

    // Arm/refresh the spring timer for the folder currently under the pointer.
    function updateSpring(value: string | null): void {
      const node = value === null ? undefined : metaByValue().get(value)?.data;
      const springable =
        value !== null && node !== undefined && isExpandable(node) && !isExpanded(value);
      if (!springable || value !== springTarget) {
        clearSpring();
      }
      if (springable && springTarget === null) {
        springTarget = value;
        springTimer = setTimeout(() => {
          springTimer = null;
          if (springTarget !== null && dragState()) {
            setExpanded(springTarget, true);
          }
          springTarget = null;
        }, SPRING_OPEN_MS);
      }
    }

    function registerDragPreview(
      template: TemplateRef<{ $implicit: T; count: number }> | null,
    ): void {
      dragPreviewTemplate = template;
    }

    // Build the floating preview when a drag starts, positioned so the pointer
    // holds it at the same spot the primary row was grabbed. `count` is the
    // number of dragged nodes.
    function createPreview(primary: string, count: number, x: number, y: number): void {
      const entry = registry.get(primary);
      const node = metaByValue().get(primary)?.data;
      if (!entry || node === undefined) {
        return;
      }
      const rect = entry.element.getBoundingClientRect();
      grabOffset = { x: x - rect.left, y: y - rect.top };

      const container = document.createElement('div');
      container.setAttribute('aria-hidden', 'true');
      Object.assign(container.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        margin: '0',
        pointerEvents: 'none',
        zIndex: '1000',
        width: `${rect.width}px`,
      } satisfies Partial<CSSStyleDeclaration>);

      if (dragPreviewTemplate) {
        previewView = viewContainerRef.createEmbeddedView(dragPreviewTemplate, {
          $implicit: node,
          count,
        });
        previewView.detectChanges();
        for (const child of previewView.rootNodes) {
          container.appendChild(child);
        }
      } else {
        // Clone the row so the preview is pixel-identical by default.
        const clone = entry.element.cloneNode(true) as HTMLElement;
        clone.removeAttribute('id');
        clone.removeAttribute('data-dragging');
        clone.style.margin = '0';
        clone.style.width = '100%';
        clone.style.boxSizing = 'border-box';
        container.appendChild(clone);
        // When moving several nodes, badge the preview with the count.
        if (count > 1) {
          container.appendChild(createCountBadge(count));
        }
      }

      movePreview(container, x, y);
      document.body.appendChild(container);
      previewEl = container;
    }

    // The badge gets a data attribute so consumers can restyle it; the inline
    // styles are a neutral, theme-agnostic default (register an `ngpTreeDragPreview`
    // template to take over the preview - and the badge - entirely).
    function createCountBadge(count: number): HTMLElement {
      const badge = document.createElement('div');
      badge.textContent = String(count);
      badge.setAttribute('data-ngp-tree-drag-badge', '');
      Object.assign(badge.style, {
        position: 'absolute',
        top: '-0.5rem',
        right: '-0.5rem',
        minWidth: '1.25rem',
        height: '1.25rem',
        padding: '0 0.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: '#fff',
        backgroundColor: 'rgba(24, 24, 27, 0.9)',
      } satisfies Partial<CSSStyleDeclaration>);
      return badge;
    }

    function movePreview(el: HTMLElement, x: number, y: number): void {
      el.style.transform = `translate(${x - grabOffset.x}px, ${y - grabOffset.y}px)`;
    }

    function destroyPreview(): void {
      previewView?.destroy();
      previewView = null;
      previewEl?.remove();
      previewEl = null;
    }

    function nodeAt(x: number, y: number): { value: string; element: HTMLElement } | null {
      const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[role="treeitem"]');
      if (!el) {
        return null;
      }
      for (const [value, entry] of registry) {
        if (entry.element === el) {
          return { value, element: el };
        }
      }
      return null;
    }

    function pointInElement(el: HTMLElement, x: number, y: number): boolean {
      const rect = el.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

    function positionIn(element: HTMLElement, y: number): NgpTreeDropPosition {
      const rect = element.getBoundingClientRect();
      const ratio = rect.height ? (y - rect.top) / rect.height : 0.5;
      return ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside';
    }

    function canDropAt(
      sources: readonly string[],
      target: string | null,
      position: NgpTreeDropPosition,
      effect: NgpTreeDropEffect = 'move',
    ): boolean {
      // Never drop onto a dragged node or into its own subtree (a root drop has
      // no target node, so it can't be a descendant).
      if (target !== null) {
        for (const source of sources) {
          if (target === source || isDescendantOf(target, source)) {
            return false;
          }
        }
      }
      const fn = canDrop();
      if (!fn) {
        return true;
      }
      const targetNode = target === null ? null : metaByValue().get(target)?.data;
      const sourceNodes = sources
        .map(source => metaByValue().get(source)?.data)
        .filter((node): node is T => node !== undefined);
      if ((target !== null && targetNode == null) || sourceNodes.length !== sources.length) {
        return false;
      }
      return fn({ sources: sourceNodes, target: targetNode ?? null, position, effect });
    }

    function isDragging(value: string): boolean {
      return dragState()?.sources.includes(value) ?? false;
    }

    function dropPositionOf(value: string): NgpTreeDropPosition | null {
      const state = dragState();
      return state && state.over === value ? state.position : null;
    }

    // --- Rename ------------------------------------------------------------
    const renamingValue = signal<string | null>(null);
    // The label at the moment editing started, to detect an unchanged commit.
    let renameOriginal = '';

    function isRenaming(value: string): boolean {
      return renamingValue() === value;
    }

    // Resolve a `boolean | predicate | undefined` enable flag for a node.
    function resolveItemFlag(flag: boolean | ((node: T) => boolean) | undefined, node: T): boolean {
      return typeof flag === 'function' ? flag(node) : flag === true;
    }

    function canRenameValue(value: string): boolean {
      const node = metaByValue().get(value)?.data;
      if (node === undefined || isDisabled(node)) {
        return false;
      }
      return resolveItemFlag(itemRenamable(), node);
    }

    function startRename(value: string): void {
      if (!canRenameValue(value)) {
        return;
      }
      const node = metaByValue().get(value)?.data;
      renameOriginal = node === undefined ? '' : labelOf(node);
      renamingValue.set(value);
    }

    function commitRename(value: string, label: string): void {
      if (renamingValue() !== value) {
        return; // already committed/cancelled (e.g. a trailing blur after Enter)
      }
      renamingValue.set(null);
      const node = metaByValue().get(value)?.data;
      const trimmed = label.trim();
      // Empty or unchanged is treated as a cancel.
      if (node !== undefined && trimmed && trimmed !== renameOriginal) {
        onRename?.({ node, value: trimmed });
      }
    }

    function cancelRename(): void {
      renamingValue.set(null);
    }

    function canDragValue(value: string): boolean {
      const node = metaByValue().get(value)?.data;
      if (node === undefined) {
        return false;
      }
      return resolveItemFlag(itemDraggable(), node);
    }

    function hasAncestorIn(value: string, set: ReadonlySet<string>): boolean {
      let parent = parentValueOf(value);
      while (parent !== undefined) {
        if (set.has(parent)) {
          return true;
        }
        parent = parentValueOf(parent);
      }
      return false;
    }

    // The set of nodes a drag/move from `grabbed` should affect: the whole
    // selection (in visible order, top-most only) when `grabbed` is part of a
    // multi-selection, otherwise just `grabbed`. Undraggable nodes are dropped.
    function moveSetFor(grabbed: string): string[] {
      const selected = selectedKeys();
      if (selectionMode() === 'none' || !selected.has(grabbed) || selected.size <= 1) {
        return canDragValue(grabbed) ? [grabbed] : [];
      }
      return visibleNodes()
        .map(keyOf)
        .filter(
          value => selected.has(value) && canDragValue(value) && !hasAncestorIn(value, selected),
        );
    }

    function beginDrag(value: string, event: PointerEvent): void {
      // Drag & drop is opt-in via `itemDraggable`; `moveSetFor` returns an empty
      // set (so we bail) when nothing is draggable.
      const sources = moveSetFor(value);
      if (sources.length === 0) {
        return;
      }
      const touch = event.pointerType === 'touch';
      pending = { primary: value, sources, x: event.clientX, y: event.clientY, touch };
      attachDragListeners();
      // Mouse/pen arm immediately; touch waits for a long-press so the list can
      // still be scrolled with a finger.
      armed = !touch;
      clearLongPress();
      if (touch) {
        longPressTimer = setTimeout(() => {
          longPressTimer = null;
          if (!pending) {
            return;
          }
          armed = true;
          navigator.vibrate?.(10);
          dragState.set({
            primary: pending.primary,
            sources: pending.sources,
            over: null,
            position: null,
            root: false,
            effect: 'move',
          });
          createPreview(pending.primary, pending.sources.length, pending.x, pending.y);
        }, TOUCH_LONG_PRESS_MS);
      }
    }

    function onPointerMove(event: PointerEvent): void {
      if (!pending) {
        return;
      }
      // Touch, before the long-press fires: a move beyond the slop is a scroll,
      // so abandon the pending drag and let the browser scroll.
      if (!armed) {
        const moved = Math.hypot(event.clientX - pending.x, event.clientY - pending.y);
        if (moved > TOUCH_SLOP) {
          clearLongPress();
          pending = null;
        }
        return;
      }
      const effect: NgpTreeDropEffect = event.altKey ? 'copy' : 'move';
      // Wait for the drag threshold before it counts as a drag.
      if (!dragState()) {
        const moved = Math.hypot(event.clientX - pending.x, event.clientY - pending.y);
        if (moved < DRAG_THRESHOLD) {
          return;
        }
        dragState.set({
          primary: pending.primary,
          sources: pending.sources,
          over: null,
          position: null,
          root: false,
          effect,
        });
        createPreview(pending.primary, pending.sources.length, event.clientX, event.clientY);
      }
      event.preventDefault();
      if (previewEl) {
        movePreview(previewEl, event.clientX, event.clientY);
      }
      const target = nodeAt(event.clientX, event.clientY);
      if (!target) {
        updateSpring(null);
        // Not over a row: offer a root drop if the pointer is still inside the
        // tree's own box (e.g. the empty space below the last row).
        const root =
          pointInElement(element.nativeElement, event.clientX, event.clientY) &&
          canDropAt(pending.sources, null, 'inside', effect);
        dragState.set({
          primary: pending.primary,
          sources: pending.sources,
          over: null,
          position: root ? 'inside' : null,
          root,
          effect,
        });
        return;
      }
      let position = positionIn(target.element, event.clientY);
      // If the target won't accept an "inside" drop (e.g. a file), fall back to
      // reordering before/after by the pointer's half, so the indicator never
      // blinks out mid-row.
      if (position === 'inside' && !canDropAt(pending.sources, target.value, 'inside', effect)) {
        const rect = target.element.getBoundingClientRect();
        const ratio = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
        position = ratio < 0.5 ? 'before' : 'after';
      }
      const over = canDropAt(pending.sources, target.value, position, effect) ? target.value : null;
      // Spring-load only when hovering over a folder to drop inside it.
      updateSpring(over && position === 'inside' ? over : null);
      dragState.set({
        primary: pending.primary,
        sources: pending.sources,
        over,
        position: over ? position : null,
        root: false,
        effect,
      });
    }

    function resetDrag(): void {
      clearLongPress();
      clearSpring();
      destroyPreview();
      pending = null;
      armed = false;
      dragState.set(null);
      detachDragListeners();
    }

    function onPointerUp(event: PointerEvent): void {
      const state = dragState();
      if (state && state.position && (state.over || state.root)) {
        // The effect reflects the modifier at the moment of the drop.
        const effect: NgpTreeDropEffect = event.altKey ? 'copy' : 'move';
        applyMove(state.sources, state.root ? null : state.over, state.position, effect);
      }
      resetDrag();
    }

    // Resolve source/target values to nodes and invoke the consumer's `onDrop`.
    // A `null` target is a root drop.
    function applyMove(
      sources: readonly string[],
      target: string | null,
      position: NgpTreeDropPosition,
      effect: NgpTreeDropEffect = 'move',
    ): void {
      const targetNode = target === null ? null : metaByValue().get(target)?.data;
      const sourceNodes = sources
        .map(source => metaByValue().get(source)?.data)
        .filter((node): node is T => node !== undefined);
      if ((target === null || targetNode != null) && sourceNodes.length > 0) {
        onDrop?.({ sources: sourceNodes, target: targetNode ?? null, position, effect });
      }
    }

    // --- Cut / paste move (keyboard-accessible) ----------------------------
    // The same move as drag & drop, driven by the keyboard: cut marks node(s),
    // paste drops them onto the focused node.
    const cutKeys = signal<ReadonlySet<string>>(new Set());

    function isCut(value: string): boolean {
      return cutKeys().has(value);
    }

    function cut(value: string): void {
      // Cut/paste is a move, gated by `itemDraggable` like a pointer drag.
      const sources = moveSetFor(value);
      cutKeys.set(new Set(sources));
    }

    function clearCut(): void {
      if (cutKeys().size > 0) {
        cutKeys.set(new Set());
      }
    }

    function paste(target: string): void {
      const sources = [...cutKeys()];
      if (sources.length === 0) {
        return;
      }
      const targetNode = metaByValue().get(target)?.data;
      if (targetNode === undefined) {
        return;
      }
      // Paste inside an expandable folder, otherwise after the focused node.
      const position: NgpTreeDropPosition = isExpandable(targetNode) ? 'inside' : 'after';
      if (!canDropAt(sources, target, position)) {
        return;
      }
      if (position === 'inside') {
        setExpanded(target, true);
      }
      applyMove(sources, target, position);
      clearCut();
    }

    // The document-level drag listeners exist only while a drag interaction is in
    // flight (from pointerdown on a draggable row until pointerup/cancel/Escape) -
    // an idle tree adds no global listeners, and the non-passive `touchmove`
    // (which would otherwise stall every page scroll) is only registered mid-drag.

    // Stop the pointer from selecting text while a drag is in progress.
    function onSelectStart(event: Event): void {
      if (pending || dragState()) {
        event.preventDefault();
      }
    }

    // Block the page from scrolling once a touch drag is active. This must be a
    // non-passive listener; the long-press held the finger still, so the first
    // move after activation is still cancellable.
    function onTouchMove(event: Event): void {
      if (armed && dragState()) {
        event.preventDefault();
      }
    }

    // Escape cancels the in-flight drag without dropping.
    function onDragKeydown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        resetDrag();
      }
    }

    const dragListeners: [string, EventListener, AddEventListenerOptions?][] = [
      ['pointermove', onPointerMove as EventListener],
      ['pointerup', onPointerUp as EventListener],
      ['pointercancel', resetDrag as EventListener],
      ['selectstart', onSelectStart],
      ['touchmove', onTouchMove, { passive: false }],
      ['keydown', onDragKeydown as EventListener],
    ];
    let dragListenersAttached = false;

    function attachDragListeners(): void {
      if (dragListenersAttached) {
        return;
      }
      dragListenersAttached = true;
      ngZone.runOutsideAngular(() => {
        for (const [event, handler, options] of dragListeners) {
          document.addEventListener(event, handler, options);
        }
      });
    }

    function detachDragListeners(): void {
      if (!dragListenersAttached) {
        return;
      }
      dragListenersAttached = false;
      for (const [event, handler, options] of dragListeners) {
        document.removeEventListener(event, handler, options);
      }
    }

    // Selection-follows-focus: in single/replace mode, moving focus selects. Skip
    // the initial tab-stop assignment so nothing is selected until the user acts.
    let followFocusPrimed = false;
    effect(() => {
      const active = roving.activeItem();
      untracked(() => {
        if (!followFocusPrimed) {
          followFocusPrimed = true;
          return;
        }
        if (selectionMode() === 'single' && selectionBehavior() === 'replace' && active) {
          const value = activeValue();
          if (value) {
            selectNode(value);
          }
        }
      });
    });

    function labelOf(node: T): string {
      const label = accessors().itemLabel?.(node);
      if (label !== undefined) {
        return label;
      }
      return registry.get(keyOf(node))?.element.textContent?.trim() ?? '';
    }

    // Type-ahead: accumulate typed characters (reset after a pause) and move focus
    // to the next visible node whose label starts with the buffer.
    let typeahead = '';
    let typeaheadTimer: ReturnType<typeof setTimeout> | undefined;

    function onTypeahead(char: string): void {
      typeahead += char.toLowerCase();
      clearTimeout(typeaheadTimer);
      typeaheadTimer = setTimeout(() => (typeahead = ''), 500);

      const visible = visibleNodes();
      const active = activeValue();
      const currentIndex = active ? visible.findIndex(node => keyOf(node) === active) : -1;

      // A repeated single character cycles through matches (search that one letter,
      // starting after the current node); a distinct sequence refines the match
      // (search the whole buffer, starting from the current node).
      const repeated = [...typeahead].every(c => c === typeahead[0]);
      const search = repeated ? typeahead[0] : typeahead;
      const start = repeated ? currentIndex + 1 : Math.max(currentIndex, 0);

      const order = [...visible.slice(start), ...visible.slice(0, start)];
      const match = order.find(node => labelOf(node).toLowerCase().startsWith(search));
      if (match) {
        focusValue(keyOf(match));
      }
    }

    onDestroy(() => {
      clearTimeout(typeaheadTimer);
      destroyPreview();
      detachDragListeners();
    });

    return {
      id,
      nodes,
      expandedKeys,
      visibleNodes,
      selectionMode,
      disabledBehavior,
      selectedKeys,
      checkedKeys,
      keyOf,
      childrenOf,
      isExpandable,
      isDisabled,
      isExpanded,
      isLoading,
      isLoadError,
      reload,
      isSelected,
      selectAll,
      clearSelection,
      activate,
      selectNode,
      isChecked,
      isIndeterminate,
      toggleChecked,
      registerDragPreview,
      isDragging,
      dropPositionOf,
      isCut,
      cut,
      paste,
      clearCut,
      isMatched,
      isRenaming,
      canRenameValue,
      startRename,
      commitRename,
      cancelRename,
      beginDrag,
      level,
      setsize,
      posinset,
      parentValueOf,
      firstChildValueOf,
      expand: value => setExpanded(value, true),
      collapse: value => setExpanded(value, false),
      toggle: value => setExpanded(value, !isExpanded(value)),
      expandSiblings,
      expandAll,
      collapseAll,
      focusValue,
      onTypeahead,
      registerNode: (value, rovingItemId, element) =>
        registry.set(value, { rovingId: rovingItemId, element }),
      unregisterNode: value => registry.delete(value),
    } satisfies NgpTreeState<T>;
  },
);

/**
 * Injects the Tree state.
 */
export function injectTreeState<T>(options?: StateInjectionOptions): Signal<NgpTreeState<T>> {
  return _injectTreeState(options) as Signal<NgpTreeState<T>>;
}
