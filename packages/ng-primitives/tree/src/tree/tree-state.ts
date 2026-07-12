import { DOCUMENT } from '@angular/common';
import {
  computed,
  effect,
  EmbeddedViewRef,
  inject,
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
  listener,
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
  readonly childrenAccessor: (node: T) => readonly T[] | undefined;
  /**
   * Whether a node can be expanded. Defaults to "has children". Override to show a
   * chevron before children are loaded (async), i.e. `isExpandable` is `true` while
   * `childrenAccessor` still returns `undefined`.
   */
  readonly isExpandable?: (node: T) => boolean;
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
   * `isExpandable` returning `true` so the chevron shows before children exist.
   */
  readonly loadChildren?: (node: T) => Promise<readonly T[]>;
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

/** Where a dragged node would land relative to the drop target. */
export type NgpTreeDropPosition = 'before' | 'inside' | 'after';

/** The payload for `canDrop` / `onDrop`. */
export interface NgpTreeDropEvent<T> {
  /** The node being dragged. */
  readonly source: T;
  /** The node it is being dropped on. */
  readonly target: T;
  /** Where relative to the target it would land. */
  readonly position: NgpTreeDropPosition;
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
  valueOf(node: T): string;
  /** Whether a node value is currently expanded. */
  isExpanded(value: string): boolean;
  /** Whether a node's children are currently being lazily loaded. */
  isLoading(value: string): boolean;
  /** Expand a node. */
  expand(value: string): void;
  /** Collapse a node. */
  collapse(value: string): void;
  /** Toggle a node's expansion. */
  toggle(value: string): void;
  /** Whether a node value is currently selected. */
  isSelected(value: string): boolean;
  /** Select all (non-disabled) nodes. */
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

  /** Whether a node may be dragged. */
  readonly canDrag?: Signal<((node: T) => boolean) | undefined>;
  /** Whether a drop is allowed. Defaults to blocking drops onto a node's own subtree. */
  readonly canDrop?: Signal<((event: NgpTreeDropEvent<T>) => boolean) | undefined>;
  /** Called when a node is dropped. Move the node in your data here. */
  readonly onDrop?: Signal<((event: NgpTreeDropEvent<T>) => void) | undefined>;
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
    canDrag = signal(undefined),
    canDrop = signal(undefined),
    onDrop = signal(undefined),
  }: NgpTreeProps<T>): NgpTreeState<T> => {
    const element = injectElementRef<HTMLElement>();
    const document = inject(DOCUMENT);
    const viewContainerRef = inject(ViewContainerRef);
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

    // Anchor for range (Shift) selection.
    let selectionAnchor: string | undefined;

    // Host bindings.
    attrBinding(element, 'role', 'tree');
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-multiselectable', () =>
      selectionMode() === 'multiple' ? 'true' : null,
    );

    function valueOf(node: T): string {
      return accessors().itemValue(node);
    }

    function childrenOf(node: T): readonly T[] {
      const explicit = accessors().childrenAccessor(node);
      if (explicit && explicit.length > 0) {
        return explicit;
      }
      // Fall back to lazily-loaded children.
      return loadedChildren().get(valueOf(node)) ?? explicit ?? [];
    }

    function isLoading(value: string): boolean {
      return loadingKeys().has(value);
    }

    async function loadNodeChildren(value: string): Promise<void> {
      const load = accessors().loadChildren;
      const node = metaByValue().get(value)?.data;
      if (!load || !node) {
        return;
      }
      // Load once; ignore if already loaded or in flight.
      if (loadedChildren().has(value) || loadingKeys().has(value)) {
        return;
      }
      loadingKeys.set(new Set(loadingKeys()).add(value));
      try {
        const children = await load(node);
        loadedChildren.set(new Map(loadedChildren()).set(value, children));
      } catch (error) {
        // Don't swallow, but don't require an error input either - the consumer
        // should handle expected failures inside `loadChildren`. Leaving the node
        // un-loaded means re-expanding retries.
        // eslint-disable-next-line no-console
        console.error('[ngpTree] loadChildren failed', error);
      } finally {
        const next = new Set(loadingKeys());
        next.delete(value);
        loadingKeys.set(next);
      }
    }

    function isExpandable(node: T): boolean {
      const { isExpandable: fn } = accessors();
      return fn ? fn(node) : childrenOf(node).length > 0;
    }

    function isDisabled(node: T): boolean {
      return accessors().itemDisabled?.(node) ?? false;
    }

    function isExpanded(value: string): boolean {
      return expandedKeys().has(value);
    }

    // Per-node hierarchy metadata, walked from the full tree.
    const metaByValue = computed(() => {
      const map = new Map<string, NgpTreeNodeMeta<T>>();
      const walk = (siblings: readonly T[], level: number, parent: string | null) => {
        siblings.forEach((node, index) => {
          map.set(valueOf(node), {
            data: node,
            level,
            parent,
            posinset: index + 1,
            setsize: siblings.length,
          });
          walk(childrenOf(node), level + 1, valueOf(node));
        });
      };
      walk(nodes(), 1, null);
      return map;
    });

    // The flattened list of visible nodes (DFS pre-order, gated by expansion).
    const visibleNodes = computed<readonly T[]>(() => {
      const expanded = expandedKeys();
      const result: T[] = [];
      const walk = (siblings: readonly T[]) => {
        for (const node of siblings) {
          result.push(node);
          if (expanded.has(valueOf(node))) {
            walk(childrenOf(node));
          }
        }
      };
      walk(nodes());
      return result;
    });

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
      return first ? valueOf(first) : undefined;
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

    function focusValue(value: string): void {
      const entry = registry.get(value);
      if (entry) {
        roving.setActiveItem(entry.rovingId, 'keyboard');
      }
    }

    function isSelectable(value: string): boolean {
      const node = metaByValue().get(value)?.data;
      return node !== undefined && !isDisabled(node);
    }

    function isSelected(value: string): boolean {
      return selectedKeys().has(value);
    }

    function selectRange(from: string, to: string): void {
      const values = visibleNodes().map(node => valueOf(node));
      const i = values.indexOf(from);
      const j = values.indexOf(to);
      if (i < 0 || j < 0) {
        return;
      }
      const [lo, hi] = i <= j ? [i, j] : [j, i];
      setSelectedKeys(new Set(values.slice(lo, hi + 1).filter(isSelectable)));
    }

    function selectNode(value: string, options: NgpTreeSelectOptions = {}): void {
      const mode = selectionMode();
      if (mode === 'none' || !isSelectable(value)) {
        return;
      }

      if (mode === 'single') {
        setSelectedKeys(new Set([value]));
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

    function selectAll(): void {
      if (selectionMode() === 'none') {
        return;
      }
      setSelectedKeys(new Set([...metaByValue().keys()].filter(isSelectable)));
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
      return children.flatMap(child => leafValuesOf(valueOf(child)));
    }

    function isChecked(value: string): boolean {
      const leaves = leafValuesOf(value);
      const checked = checkedKeys();
      return leaves.length > 0 && leaves.every(leaf => checked.has(leaf));
    }

    function isIndeterminate(value: string): boolean {
      const leaves = leafValuesOf(value);
      const checked = checkedKeys();
      const some = leaves.some(leaf => checked.has(leaf));
      return some && !leaves.every(leaf => checked.has(leaf));
    }

    function toggleChecked(value: string): void {
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
    // threshold press so a plain click never registers as a drag.
    const dragState = signal<{
      source: string;
      over: string | null;
      position: NgpTreeDropPosition | null;
    } | null>(null);
    // Live pointer position, for a floating drag preview.
    let pending: { source: string; x: number; y: number; touch: boolean } | null = null;
    // A floating preview that mirrors the dragged row (a DOM clone by default,
    // or a consumer template registered via `ngpTreeDragPreview`).
    let dragPreviewTemplate: TemplateRef<{ $implicit: T }> | null = null;
    let previewEl: HTMLElement | null = null;
    let previewView: EmbeddedViewRef<{ $implicit: T }> | null = null;
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

    function registerDragPreview(template: TemplateRef<{ $implicit: T }> | null): void {
      dragPreviewTemplate = template;
    }

    // Build the floating preview when a drag starts, positioned so the pointer
    // holds it at the same spot it was grabbed.
    function createPreview(source: string, x: number, y: number): void {
      const entry = registry.get(source);
      const node = metaByValue().get(source)?.data;
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
        previewView = viewContainerRef.createEmbeddedView(dragPreviewTemplate, { $implicit: node });
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
      }

      movePreview(container, x, y);
      document.body.appendChild(container);
      previewEl = container;
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

    function positionIn(element: HTMLElement, y: number): NgpTreeDropPosition {
      const rect = element.getBoundingClientRect();
      const ratio = rect.height ? (y - rect.top) / rect.height : 0.5;
      return ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside';
    }

    function canDropAt(source: string, target: string, position: NgpTreeDropPosition): boolean {
      // Never drop onto itself or into its own subtree.
      if (target === source || isDescendantOf(target, source)) {
        return false;
      }
      const fn = canDrop();
      if (!fn) {
        return true;
      }
      const sourceNode = metaByValue().get(source)?.data;
      const targetNode = metaByValue().get(target)?.data;
      if (sourceNode === undefined || targetNode === undefined) {
        return false;
      }
      return fn({ source: sourceNode, target: targetNode, position });
    }

    function isDragging(value: string): boolean {
      return dragState()?.source === value;
    }

    function dropPositionOf(value: string): NgpTreeDropPosition | null {
      const state = dragState();
      return state && state.over === value ? state.position : null;
    }

    function beginDrag(value: string, event: PointerEvent): void {
      const fn = canDrag();
      const node = metaByValue().get(value)?.data;
      if (node === undefined || (fn && !fn(node))) {
        return;
      }
      const touch = event.pointerType === 'touch';
      pending = { source: value, x: event.clientX, y: event.clientY, touch };
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
          dragState.set({ source: pending.source, over: null, position: null });
          createPreview(pending.source, pending.x, pending.y);
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
      // Wait for the drag threshold before it counts as a drag.
      if (!dragState()) {
        const moved = Math.hypot(event.clientX - pending.x, event.clientY - pending.y);
        if (moved < DRAG_THRESHOLD) {
          return;
        }
        dragState.set({ source: pending.source, over: null, position: null });
        createPreview(pending.source, event.clientX, event.clientY);
      }
      event.preventDefault();
      if (previewEl) {
        movePreview(previewEl, event.clientX, event.clientY);
      }
      const target = nodeAt(event.clientX, event.clientY);
      if (!target) {
        updateSpring(null);
        dragState.set({ source: pending.source, over: null, position: null });
        return;
      }
      let position = positionIn(target.element, event.clientY);
      // If the target won't accept an "inside" drop (e.g. a file), fall back to
      // reordering before/after by the pointer's half, so the indicator never
      // blinks out mid-row.
      if (position === 'inside' && !canDropAt(pending.source, target.value, 'inside')) {
        const rect = target.element.getBoundingClientRect();
        const ratio = rect.height ? (event.clientY - rect.top) / rect.height : 0.5;
        position = ratio < 0.5 ? 'before' : 'after';
      }
      const over = canDropAt(pending.source, target.value, position) ? target.value : null;
      // Spring-load only when hovering over a folder to drop inside it.
      updateSpring(over && position === 'inside' ? over : null);
      dragState.set({ source: pending.source, over, position: over ? position : null });
    }

    function resetDrag(): void {
      clearLongPress();
      clearSpring();
      destroyPreview();
      pending = null;
      armed = false;
      dragState.set(null);
    }

    function onPointerUp(): void {
      const state = dragState();
      if (state && state.over && state.position) {
        const sourceNode = metaByValue().get(state.source)?.data;
        const targetNode = metaByValue().get(state.over)?.data;
        if (sourceNode !== undefined && targetNode !== undefined) {
          onDrop()?.({ source: sourceNode, target: targetNode, position: state.position });
        }
      }
      resetDrag();
    }

    listener(document, 'pointermove', onPointerMove as (e: Event) => void);
    listener(document, 'pointerup', onPointerUp);
    listener(document, 'pointercancel', resetDrag);
    // Stop the pointer from selecting text while a drag is in progress.
    listener(document, 'selectstart', (event: Event) => {
      if (pending || dragState()) {
        event.preventDefault();
      }
    });
    // Block the page from scrolling once a touch drag is active. This must be a
    // non-passive listener; the long-press held the finger still, so the first
    // move after activation is still cancellable.
    listener(
      document,
      'touchmove',
      (event: Event) => {
        if (armed && dragState()) {
          event.preventDefault();
        }
      },
      { config: { passive: false } },
    );

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
      return registry.get(valueOf(node))?.element.textContent?.trim() ?? '';
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
      const currentIndex = active ? visible.findIndex(node => valueOf(node) === active) : -1;

      // A repeated single character cycles through matches (search that one letter,
      // starting after the current node); a distinct sequence refines the match
      // (search the whole buffer, starting from the current node).
      const repeated = [...typeahead].every(c => c === typeahead[0]);
      const search = repeated ? typeahead[0] : typeahead;
      const start = repeated ? currentIndex + 1 : Math.max(currentIndex, 0);

      const order = [...visible.slice(start), ...visible.slice(0, start)];
      const match = order.find(node => labelOf(node).toLowerCase().startsWith(search));
      if (match) {
        focusValue(valueOf(match));
      }
    }

    onDestroy(() => {
      clearTimeout(typeaheadTimer);
      destroyPreview();
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
      valueOf,
      childrenOf,
      isExpandable,
      isDisabled,
      isExpanded,
      isLoading,
      isSelected,
      selectAll,
      clearSelection,
      selectNode,
      isChecked,
      isIndeterminate,
      toggleChecked,
      registerDragPreview,
      isDragging,
      dropPositionOf,
      beginDrag,
      level,
      setsize,
      posinset,
      parentValueOf,
      firstChildValueOf,
      expand: value => setExpanded(value, true),
      collapse: value => setExpanded(value, false),
      toggle: value => setExpanded(value, !isExpanded(value)),
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
