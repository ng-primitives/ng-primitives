import { computed, effect, signal, Signal, untracked } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpRovingFocusItem } from 'ng-primitives/roving-focus';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  StateInjectionOptions,
  styleBinding,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectTreeState } from '../tree/tree-state';

let isMacCache: boolean | undefined;

/** Whether we're on a Mac/iOS platform (cached; SSR-safe). */
function isApplePlatform(): boolean {
  if (isMacCache === undefined) {
    isMacCache =
      typeof navigator !== 'undefined' &&
      /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent || '');
  }
  return isMacCache;
}

/**
 * The platform's toggle/multi-select modifier: Cmd on Apple, Ctrl elsewhere. On a
 * Mac, Ctrl-click is the secondary-click gesture, so only Cmd should toggle.
 */
function hasToggleModifier(event: {
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
}): boolean {
  return isApplePlatform() ? event.metaKey : event.ctrlKey;
}

/**
 * The state for a single tree node. Bound to the row element, which becomes the
 * `treeitem`. Level / set-size / position and expansion are all derived from the
 * surrounding `[ngpTree]` by the node's value, so a flat `@for` (or virtual loop)
 * of `visibleNodes()` renders correctly.
 */
export interface NgpTreeNodeState {
  /** The unique id for this node element. */
  readonly id: Signal<string>;
  /** The stable string identity of this node. */
  readonly value: Signal<string>;
  /** The 1-based depth of this node (root nodes are level 1). */
  readonly level: Signal<number>;
  /** The number of siblings (including this node) in its group. */
  readonly setsize: Signal<number>;
  /** The 1-based position of this node within its sibling group. */
  readonly posinset: Signal<number>;
  /** Whether this node can be expanded. */
  readonly expandable: Signal<boolean>;
  /** Whether this node is currently expanded. */
  readonly expanded: Signal<boolean>;
  /** Whether this node is disabled. */
  readonly disabled: Signal<boolean>;
  /** Whether this node is currently selected. */
  readonly selected: Signal<boolean>;
  /** Whether this node's checkbox is fully checked. */
  readonly checked: Signal<boolean>;
  /** Whether this node's checkbox is partially checked. */
  readonly indeterminate: Signal<boolean>;
  /** Whether this node's children are currently being lazily loaded. */
  readonly loading: Signal<boolean>;
  /** Whether this node is currently being dragged. */
  readonly dragging: Signal<boolean>;
  /** The drop position if this node is the current drop target, else `null`. */
  readonly dropPosition: Signal<'before' | 'inside' | 'after' | null>;

  /** Expand this node. */
  expand(): void;
  /** Collapse this node. */
  collapse(): void;
  /** Toggle this node's expansion. */
  toggle(): void;
  /** Select this node (replacing the selection in single/replace mode). */
  select(): void;
  /** Toggle this node's selection. */
  toggleSelected(): void;
  /** Toggle this node's checkbox, propagating to descendants. */
  toggleChecked(): void;
}

/**
 * The props for a tree node.
 */
export interface NgpTreeNodeProps {
  /** The raw node data. */
  readonly data: Signal<unknown>;
}

export const [NgpTreeNodeStateToken, ngpTreeNode, _injectTreeNodeState, provideTreeNodeState] =
  createPrimitive('NgpTreeNode', ({ data }: NgpTreeNodeProps): NgpTreeNodeState => {
    const element = injectElementRef<HTMLElement>();
    const tree = injectTreeState();
    const id = signal(uniqueId('ngp-tree-node'));

    const value = computed(() => tree().valueOf(data()));
    const expandable = computed(() => tree().isExpandable(data()));
    const expanded = computed(() => tree().isExpanded(value()));
    const disabled = computed(() => tree().isDisabled(data()));
    // In `selection` disabled-behavior a disabled node is still focusable and
    // expandable (just not selectable); in `all` it is fully inert.
    const focusExpandDisabled = computed(() => disabled() && tree().disabledBehavior() === 'all');
    const selected = computed(() => tree().isSelected(value()));
    const checked = computed(() => tree().isChecked(value()));
    const indeterminate = computed(() => tree().isIndeterminate(value()));
    const loading = computed(() => tree().isLoading(value()));
    const dragging = computed(() => tree().isDragging(value()));
    const dropPosition = computed(() => tree().dropPositionOf(value()));
    const level = computed(() => tree().level(value()));
    const setsize = computed(() => tree().setsize(value()));
    const posinset = computed(() => tree().posinset(value()));

    // Roving tabindex + Up/Down/Home/End + focus, shared with the tree's group.
    const rovingItem = ngpRovingFocusItem({ disabled: focusExpandDisabled });

    // Host bindings.
    attrBinding(element, 'role', 'treeitem');
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-level', level);
    attrBinding(element, 'aria-setsize', setsize);
    attrBinding(element, 'aria-posinset', posinset);
    // Only expandable nodes expose aria-expanded; leaves must omit it entirely so
    // assistive tech doesn't announce them as parents.
    attrBinding(element, 'aria-expanded', () => (expandable() ? expanded() : null));
    attrBinding(element, 'aria-disabled', () => (disabled() ? 'true' : null));
    attrBinding(element, 'aria-busy', () => (loading() ? 'true' : null));
    dataBinding(element, 'data-loading', loading);
    // aria-selected only on selectable nodes while a selection mode is active.
    attrBinding(element, 'aria-selected', () =>
      tree().selectionMode() === 'none' || disabled() ? null : selected() ? 'true' : 'false',
    );
    dataBinding(element, 'data-expanded', expanded);
    dataBinding(element, 'data-expandable', expandable);
    dataBinding(element, 'data-disabled', disabled);
    dataBinding(element, 'data-selected', selected);
    dataBinding(element, 'data-dragging', dragging);
    dataBinding(element, 'data-drop-target', () => dropPosition() !== null);
    dataBinding(element, 'data-drop-position', () => dropPosition());
    dataBinding(element, 'data-level', () => String(level()));
    // Expose the depth as a CSS variable so consumers can indent without binding
    // it by hand, e.g. `padding-left: calc(var(--ngp-tree-node-level) * 1rem)`.
    styleBinding(element, '--ngp-tree-node-level', level);

    // Start a pointer drag (a plain click never passes the drag threshold).
    listener(element, 'pointerdown', (event: PointerEvent) => {
      if (event.button === 0) {
        tree().beginDrag(value(), event);
      }
    });

    // Select on click (the toggle stops propagation, so chevron clicks don't select).
    listener(element, 'click', (event: MouseEvent) => {
      if (disabled() || tree().selectionMode() === 'none') {
        return;
      }
      tree().selectNode(value(), {
        toggle: hasToggleModifier(event),
        range: event.shiftKey,
      });
    });

    // Tree-specific keys (Up/Down/Home/End are handled by the roving item).
    listener(element, 'keydown', (event: KeyboardEvent) => {
      // In `all` mode a disabled node ignores keys entirely; in `selection` mode
      // navigation/expansion still work (selection actions no-op via selectNode).
      if (focusExpandDisabled()) {
        return;
      }
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          if (expandable() && !expanded()) {
            tree().expand(value());
          } else if (expanded()) {
            const child = tree().firstChildValueOf(value());
            if (child) {
              tree().focusValue(child);
            }
          }
          break;
        case 'ArrowLeft':
          event.preventDefault();
          if (expanded()) {
            tree().collapse(value());
          } else {
            const parent = tree().parentValueOf(value());
            if (parent) {
              tree().focusValue(parent);
            }
          }
          break;
        case 'Enter':
          if (tree().selectionMode() !== 'none') {
            event.preventDefault();
            tree().selectNode(value());
          }
          break;
        case ' ':
          if (tree().selectionMode() !== 'none') {
            event.preventDefault();
            tree().selectNode(value(), { toggle: true });
          }
          break;
        default:
          // Cmd/Ctrl+A selects all in multiple mode (platform modifier).
          if ((event.key === 'a' || event.key === 'A') && hasToggleModifier(event)) {
            if (tree().selectionMode() === 'multiple') {
              event.preventDefault();
              tree().selectAll();
            }
            break;
          }
          // Printable single characters drive type-ahead (Space is reserved for
          // selection, and modified keys are shortcuts).
          if (
            event.key.length === 1 &&
            event.key !== ' ' &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.altKey
          ) {
            tree().onTypeahead(event.key);
          }
          break;
      }
    });

    // Register value -> roving id + element so the tree can focus / type-ahead by value.
    effect(onCleanup => {
      const nodeValue = value();
      const treeState = tree();
      const rovingId = rovingItem.id();
      const el = element.nativeElement;
      untracked(() => treeState.registerNode(nodeValue, rovingId, el));
      onCleanup(() => untracked(() => treeState.unregisterNode(nodeValue)));
    });

    return {
      id,
      value,
      level,
      setsize,
      posinset,
      expandable,
      expanded,
      disabled,
      selected,
      checked,
      indeterminate,
      loading,
      dragging,
      dropPosition,
      expand: () => tree().expand(value()),
      collapse: () => tree().collapse(value()),
      toggle: () => tree().toggle(value()),
      select: () => tree().selectNode(value()),
      toggleSelected: () => tree().selectNode(value(), { toggle: true }),
      toggleChecked: () => tree().toggleChecked(value()),
    } satisfies NgpTreeNodeState;
  });

/**
 * Injects the nearest TreeNode state.
 */
export function injectTreeNodeState(options?: StateInjectionOptions): Signal<NgpTreeNodeState> {
  return _injectTreeNodeState(options) as Signal<NgpTreeNodeState>;
}
