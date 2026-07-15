import { ApplicationRef, computed, effect, inject, signal, Signal, untracked } from '@angular/core';
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
  /** Whether this node's last lazy load failed (cleared on retry/success). */
  readonly loadError: Signal<boolean>;
  /** Whether this node is currently being dragged. */
  readonly dragging: Signal<boolean>;
  /** The drop position if this node is the current drop target, else `null`. */
  readonly dropPosition: Signal<'before' | 'inside' | 'after' | null>;
  /** Whether this node is currently being renamed. */
  readonly renaming: Signal<boolean>;
  /** Whether this node can be renamed (renaming enabled, allowed, and not disabled). */
  readonly renamable: Signal<boolean>;
  /** Whether this node is marked for a cut/paste move. */
  readonly cut: Signal<boolean>;
  /** Whether this node matches the current search query. */
  readonly matched: Signal<boolean>;

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
  /** Begin renaming this node (no-op unless renaming is enabled for it). */
  startRename(): void;
  /** Commit the in-progress rename with the entered label. */
  commitRename(label: string): void;
  /** Cancel the in-progress rename. */
  cancelRename(): void;
  /** Retry this node's failed lazy load in place. */
  reload(): void;
  /** Move roving focus to this node's row. */
  focus(): void;
  /**
   * @internal Register that this node renders a checkbox, so Space toggles it
   * from the row. Returns a cleanup to call when the checkbox is destroyed.
   */
  registerCheckbox(): () => void;
  /**
   * @internal Register that this node has a dedicated drag handle, so the row
   * body no longer starts a drag. Returns a cleanup for when it's destroyed.
   */
  registerDragHandle(): () => void;
  /** @internal Begin a pointer drag from this node (called by the drag handle). */
  startDrag(event: PointerEvent): void;
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
    const appRef = inject(ApplicationRef);
    const id = signal(uniqueId('ngp-tree-node'));

    // Whether this row renders a checkbox (registered by NgpTreeNodeCheckbox), so
    // Space toggles the checkbox instead of (or as well as) the selection.
    const hasCheckbox = signal(false);
    // Whether this row has a dedicated drag handle (registered by
    // NgpTreeNodeDragHandle); when it does, the row body no longer starts drags.
    const hasDragHandle = signal(false);

    const value = computed(() => tree().keyOf(data()));
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
    const loadError = computed(() => tree().isLoadError(value()));
    const dragging = computed(() => tree().isDragging(value()));
    const dropPosition = computed(() => tree().dropPositionOf(value()));
    const renaming = computed(() => tree().isRenaming(value()));
    const renamable = computed(() => tree().canRenameValue(value()));
    const cut = computed(() => tree().isCut(value()));
    const matched = computed(() => tree().isMatched(value()));
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
    dataBinding(element, 'data-load-error', loadError);
    // aria-selected only on selectable nodes while a selection mode is active.
    attrBinding(element, 'aria-selected', () =>
      tree().selectionMode() === 'none' || disabled() ? null : selected() ? 'true' : 'false',
    );
    // Per the APG checkbox-tree pattern the treeitem itself carries aria-checked
    // (the rendered checkbox part is decorative for AT).
    attrBinding(element, 'aria-checked', () =>
      hasCheckbox() ? (indeterminate() ? 'mixed' : checked() ? 'true' : 'false') : null,
    );
    dataBinding(element, 'data-expanded', expanded);
    dataBinding(element, 'data-expandable', expandable);
    dataBinding(element, 'data-disabled', disabled);
    dataBinding(element, 'data-selected', selected);
    dataBinding(element, 'data-dragging', dragging);
    dataBinding(element, 'data-drop-target', () => dropPosition() !== null);
    dataBinding(element, 'data-drop-position', () => dropPosition());
    dataBinding(element, 'data-renaming', renaming);
    dataBinding(element, 'data-cut', cut);
    dataBinding(element, 'data-matched', matched);
    dataBinding(element, 'data-level', () => String(level()));
    // Expose the depth as a CSS variable so consumers can indent without binding
    // it by hand, e.g. `padding-left: calc(var(--ngp-tree-node-level) * 1rem)`.
    styleBinding(element, '--ngp-tree-node-level', level);

    // Start a pointer drag from the row (a plain click never passes the drag
    // threshold). When a drag handle is present, only it starts drags.
    listener(element, 'pointerdown', (event: PointerEvent) => {
      if (event.button === 0 && !hasDragHandle()) {
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

    // Rapid clicks/taps on the row's interactive parts (chevron, checkbox, drag
    // handle, rename field) must not read as a row double-click - e.g. quickly
    // toggling a folder twice should not start a rename.
    function isInteractivePart(target: EventTarget | null): boolean {
      return (
        target instanceof Element &&
        target.closest(
          '[ngpTreeNodeToggle], [ngpTreeNodeCheckbox], [ngpTreeNodeDragHandle], [ngpTreeNodeRename]',
        ) !== null
      );
    }

    // Double-click a row to rename it (mouse/pen); if it isn't renamable, a
    // double-click activates ("opens") it instead.
    listener(element, 'dblclick', (event: MouseEvent) => {
      if (isInteractivePart(event.target)) {
        return;
      }
      if (tree().canRenameValue(value())) {
        tree().startRename(value());
      } else {
        tree().activate(value());
      }
    });

    // `dblclick` is unreliable on touch (and suppressed by `touch-action:
    // manipulation`), so detect a double-tap manually from consecutive taps.
    let lastTapTime: number | null = null;
    listener(element, 'pointerup', (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || isInteractivePart(event.target)) {
        return;
      }
      if (lastTapTime !== null && event.timeStamp - lastTapTime < 300) {
        lastTapTime = null;
        if (tree().canRenameValue(value())) {
          tree().startRename(value());
          // iOS only opens the soft keyboard when focus happens inside the
          // gesture task. `afterNextRender` is too late (it runs after the
          // async CD), so render the field synchronously and focus it now.
          appRef.tick();
          element.nativeElement.querySelector<HTMLElement>('[ngpTreeNodeRename]')?.focus();
        } else {
          tree().activate(value());
        }
      } else {
        lastTapTime = event.timeStamp;
      }
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
        case 'ArrowLeft': {
          event.preventDefault();
          // In RTL the horizontal arrows swap: ArrowLeft expands, ArrowRight
          // collapses. Read the computed direction so `dir="rtl"` (or CSS) works.
          const rtl = getComputedStyle(element.nativeElement).direction === 'rtl';
          const expandArrow = rtl ? 'ArrowLeft' : 'ArrowRight';
          if (event.key === expandArrow) {
            if (expandable() && !expanded()) {
              tree().expand(value());
            } else if (expanded()) {
              const child = tree().firstChildValueOf(value());
              if (child) {
                tree().focusValue(child);
              }
            }
          } else {
            if (expanded()) {
              tree().collapse(value());
            } else {
              const parent = tree().parentValueOf(value());
              if (parent) {
                tree().focusValue(parent);
              }
            }
          }
          break;
        }
        case 'Enter':
          event.preventDefault();
          // Enter activates ("opens") the node, and also selects it when a
          // selection mode is active.
          tree().activate(value());
          if (tree().selectionMode() !== 'none') {
            tree().selectNode(value());
          }
          break;
        case ' ':
          // A checkbox tree is often selection-less, so Space must still be able
          // to check the row. When a checkbox is present it takes precedence;
          // otherwise Space toggles the selection.
          if (hasCheckbox() && !disabled()) {
            event.preventDefault();
            tree().toggleChecked(value());
          } else if (tree().selectionMode() !== 'none') {
            event.preventDefault();
            tree().selectNode(value(), { toggle: true });
          }
          break;
        case 'F2':
          if (tree().canRenameValue(value())) {
            event.preventDefault();
            tree().startRename(value());
          }
          break;
        case '*':
          // APG: expand all sibling nodes at the focused node's level.
          event.preventDefault();
          tree().expandSiblings(value());
          break;
        case 'Escape':
          // Clear a pending cut, if any.
          tree().clearCut();
          break;
        default:
          // Platform-modifier shortcuts (Cmd on macOS, Ctrl elsewhere).
          if (hasToggleModifier(event)) {
            const key = event.key.toLowerCase();
            if (key === 'a' && tree().selectionMode() === 'multiple') {
              event.preventDefault();
              tree().selectAll();
              break;
            }
            // Cut / paste move.
            if (key === 'x') {
              event.preventDefault();
              tree().cut(value());
              break;
            }
            if (key === 'v') {
              event.preventDefault();
              tree().paste(value());
              break;
            }
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
      loadError,
      dragging,
      dropPosition,
      renaming,
      renamable,
      cut,
      matched,
      expand: () => tree().expand(value()),
      collapse: () => tree().collapse(value()),
      toggle: () => tree().toggle(value()),
      select: () => tree().selectNode(value()),
      toggleSelected: () => tree().selectNode(value(), { toggle: true }),
      toggleChecked: () => tree().toggleChecked(value()),
      startRename: () => tree().startRename(value()),
      commitRename: (label: string) => tree().commitRename(value(), label),
      cancelRename: () => tree().cancelRename(),
      reload: () => tree().reload(value()),
      focus: () => tree().focusValue(value()),
      registerCheckbox: () => {
        hasCheckbox.set(true);
        return () => hasCheckbox.set(false);
      },
      registerDragHandle: () => {
        hasDragHandle.set(true);
        return () => hasDragHandle.set(false);
      },
      startDrag: (event: PointerEvent) => {
        if (event.button === 0) {
          tree().beginDrag(value(), event);
        }
      },
    } satisfies NgpTreeNodeState;
  });

/**
 * Injects the nearest TreeNode state.
 */
export function injectTreeNodeState(options?: StateInjectionOptions): Signal<NgpTreeNodeState> {
  return _injectTreeNodeState(options) as Signal<NgpTreeNodeState>;
}
