import { computed, isDevMode, signal, Signal, WritableSignal } from '@angular/core';
import { createPrimitive } from 'ng-primitives/state';
import {
  NgpDrawerChangeReason,
  NgpDrawerModal,
  NgpDrawerSnapPoint,
  NgpDrawerSwipeDirection,
} from '../drawer.types';
import { DrawerVisualStateStore } from './visual-state-store';

export type DrawerUniquePart = 'portal' | 'popup' | 'viewport';

export interface DrawerRequestContext {
  nativeEvent?: Event | null;
  trigger?: HTMLElement | null;
}

export interface DrawerStateProps {
  readonly open: Signal<boolean>;
  readonly nested: Signal<boolean>;
  readonly expanded: Signal<boolean>;
  readonly snapPoint: Signal<NgpDrawerSnapPoint | null | undefined>;
  readonly triggerId: WritableSignal<string | null>;
  readonly modal: Signal<NgpDrawerModal>;
  readonly disablePointerDismissal: Signal<boolean>;
  readonly swipeDirection: Signal<NgpDrawerSwipeDirection>;
  readonly snapPoints: Signal<readonly NgpDrawerSnapPoint[] | undefined>;
  readonly defaultSnapPoint: Signal<NgpDrawerSnapPoint | null | undefined>;
  readonly snapToSequentialPoints: Signal<boolean>;
  readonly payload: Signal<unknown>;
  readonly mounted: WritableSignal<boolean>;
  readonly preventUnmount: WritableSignal<boolean>;
  readonly requestOpen: (
    nextOpen: boolean,
    reason: NgpDrawerChangeReason,
    context?: DrawerRequestContext,
    payload?: unknown,
  ) => boolean;
  readonly requestSnapPoint: (
    point: NgpDrawerSnapPoint | null | undefined,
    reason: NgpDrawerChangeReason,
    context?: DrawerRequestContext,
  ) => boolean;
  readonly completeOpenChange: (open: boolean) => void;
  readonly requestUnmount: () => void;
}

export interface DrawerState extends DrawerStateProps {
  readonly elements: Set<HTMLElement>;
  readonly titleIds: WritableSignal<readonly string[]>;
  readonly descriptionIds: WritableSignal<readonly string[]>;
  readonly activeTrigger: WritableSignal<HTMLElement | null>;
  readonly popup: WritableSignal<HTMLElement | null>;
  readonly viewport: WritableSignal<HTMLElement | null>;
  readonly backdrop: WritableSignal<HTMLElement | null>;
  readonly portalAttached: WritableSignal<boolean>;
  readonly portalVisible: WritableSignal<boolean>;
  readonly popupHeight: WritableSignal<number>;
  readonly swiping: WritableSignal<boolean>;
  readonly swipeDismiss: WritableSignal<NgpDrawerSwipeDirection | null>;
  readonly startingStyle: WritableSignal<boolean>;
  readonly endingStyle: WritableSignal<boolean>;
  readonly transitionGeneration: WritableSignal<number>;
  readonly unmountGeneration: WritableSignal<number>;
  readonly visualStore: DrawerVisualStateStore;
  readonly nestedVisualStore: DrawerVisualStateStore;
  readonly nestedCount: Signal<number>;
  readonly nestedOpen: Signal<boolean>;
  readonly nestedPresent: Signal<boolean>;
  readonly nestedSwiping: Signal<boolean>;
  readonly frontmostHeight: Signal<number>;
  registerNested(child: DrawerState): () => void;
  registerElement(element: HTMLElement): () => void;
  setPartElement(part: 'popup' | 'viewport' | 'backdrop', element: HTMLElement): () => void;
  claimPart(part: DrawerUniquePart): () => void;
  /**
   * Whether the viewport is currently driving `--ngp-drawer-height` from an active snap point.
   * `bindDrawerNestedVisuals` runs later in the same render phase and must not overwrite it.
   * @internal
   */
  snapHeightOwned(): boolean;
  /** @internal */
  setSnapHeightOwned(owned: boolean): void;
  /**
   * Registers a listener fired when the viewport stops driving `--ngp-drawer-height`. The
   * viewport's restore writes back a snapshot taken before it took ownership, which can be stale
   * if nested state changed in between, so the other writers must re-apply on release.
   * @internal
   */
  onSnapHeightReleased(listener: () => void): () => void;
  registerTitle(id: string): () => void;
  registerDescription(id: string): () => void;
  containsEvent(event: Event): boolean;
  nextTransitionGeneration(): number;
}

export function createDrawerState(props: DrawerStateProps): DrawerState {
  const elements = new Set<HTMLElement>();
  let snapHeightOwned = false;
  const snapHeightReleaseListeners = new Set<() => void>();
  const uniqueParts = new Set<DrawerUniquePart>();
  const titleIds = signal<readonly string[]>([]);
  const descriptionIds = signal<readonly string[]>([]);
  const activeTrigger = signal<HTMLElement | null>(null);
  const popup = signal<HTMLElement | null>(null);
  const viewport = signal<HTMLElement | null>(null);
  const backdrop = signal<HTMLElement | null>(null);
  const portalAttached = signal(false);
  const portalVisible = signal(false);
  const popupHeight = signal(0);
  const swiping = signal(false);
  const swipeDismiss = signal<NgpDrawerSwipeDirection | null>(null);
  const startingStyle = signal(false);
  const endingStyle = signal(false);
  const transitionGeneration = signal(0);
  const unmountGeneration = signal(0);
  const nestedChildren = new Set<DrawerState>();
  const nestedVersion = signal(0);
  const visualStore = new DrawerVisualStateStore();
  const nestedVisualStore = new DrawerVisualStateStore();
  const nestedUnsubscribers = new Map<DrawerState, () => void>();

  const syncNestedVisuals = (): void => {
    const frontmost = [...nestedChildren]
      .filter(child => child.open() || child.portalVisible())
      .at(-1);
    const snapshot = frontmost?.visualStore.getSnapshot();
    nestedVisualStore.set({
      progress: snapshot?.progress ?? 0,
      strength: snapshot?.strength ?? 0,
      movementX: snapshot?.movementX ?? 0,
      movementY: snapshot?.movementY ?? 0,
      frontmostHeight: snapshot?.frontmostHeight ?? 0,
    });
  };

  const state: DrawerState = {
    ...props,
    elements,
    titleIds,
    descriptionIds,
    activeTrigger,
    popup,
    viewport,
    backdrop,
    portalAttached,
    portalVisible,
    popupHeight,
    swiping,
    swipeDismiss,
    startingStyle,
    endingStyle,
    transitionGeneration,
    unmountGeneration,
    visualStore,
    nestedVisualStore,
    nestedCount: computed(() => {
      nestedVersion();
      // Mirrors base UI's `nestedOpenDrawerCount`: driven purely by `open()` so the
      // parent's scale-down transform starts returning to its resting size in
      // parallel with the child's own exit transition, instead of waiting for
      // `mounted()` to flip once the exit animation (and unmount) fully completes.
      return [...nestedChildren]
        .filter(child => child.open())
        .reduce((count, child) => count + 1 + child.nestedCount(), 0);
    }),
    nestedOpen: computed(() => {
      nestedVersion();
      return [...nestedChildren].some(child => child.open() || child.nestedOpen());
    }),
    nestedPresent: computed(() => {
      nestedVersion();
      return [...nestedChildren].some(
        child => child.open() || child.portalVisible() || child.nestedPresent(),
      );
    }),
    nestedSwiping: computed(() => {
      nestedVersion();
      return [...nestedChildren].some(child => child.swiping() || child.nestedSwiping());
    }),
    frontmostHeight: computed(() => {
      nestedVersion();
      // Mirrors base UI: the reported frontmost height cascades based on `open()`
      // only, so an ancestor starts shrinking back towards its own height in
      // parallel with a closing descendant's exit transition. `nestedPresent()`
      // (below) is what keeps `--ngp-drawer-height` pinned to a fixed pixel value for
      // the CSS transition to animate from — this signal must not also lag behind
      // it, or the shrink-back only becomes visible once the descendant unmounts.
      const child = [...nestedChildren].filter(value => value.open()).at(-1);
      return child?.frontmostHeight() ?? popupHeight();
    }),
    registerNested(child: DrawerState): () => void {
      nestedChildren.add(child);
      nestedUnsubscribers.set(child, child.visualStore.subscribe(syncNestedVisuals));
      nestedVersion.update(value => value + 1);
      syncNestedVisuals();
      return () => {
        nestedUnsubscribers.get(child)?.();
        nestedUnsubscribers.delete(child);
        nestedChildren.delete(child);
        nestedVersion.update(value => value + 1);
        syncNestedVisuals();
      };
    },
    registerElement(element: HTMLElement): () => void {
      elements.add(element);
      return () => elements.delete(element);
    },
    setPartElement(part: 'popup' | 'viewport' | 'backdrop', element: HTMLElement): () => void {
      const target = part === 'popup' ? popup : part === 'viewport' ? viewport : backdrop;
      target.set(element);
      if (part !== 'viewport') {
        elements.add(element);
      }
      return () => {
        if (target() === element) {
          target.set(null);
        }
        elements.delete(element);
      };
    },
    claimPart(part: DrawerUniquePart): () => void {
      if (uniqueParts.has(part) && isDevMode()) {
        throw new Error(`ngpDrawer: only one ${part} may be registered per root.`);
      }
      uniqueParts.add(part);
      return () => uniqueParts.delete(part);
    },
    snapHeightOwned(): boolean {
      return snapHeightOwned;
    },
    setSnapHeightOwned(owned: boolean): void {
      const wasOwned = snapHeightOwned;
      snapHeightOwned = owned;
      // Only the owned → unowned edge matters. Firing on every call would re-run the freeze on
      // every render pass, and firing on acquisition would fight the viewport's own write.
      if (wasOwned && !owned) {
        for (const listener of snapHeightReleaseListeners) {
          listener();
        }
      }
    },
    onSnapHeightReleased(listener: () => void): () => void {
      snapHeightReleaseListeners.add(listener);
      return () => snapHeightReleaseListeners.delete(listener);
    },
    registerTitle(id: string): () => void {
      titleIds.update(ids => [...ids, id]);
      return () => titleIds.update(ids => ids.filter(value => value !== id));
    },
    registerDescription(id: string): () => void {
      descriptionIds.update(ids => [...ids, id]);
      return () => descriptionIds.update(ids => ids.filter(value => value !== id));
    },
    containsEvent(event: Event): boolean {
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      const triggerId = props.triggerId();
      if (
        triggerId &&
        path.some(target => target instanceof HTMLElement && target.id === triggerId)
      ) {
        return true;
      }
      return [...elements].some(element => {
        if (path.includes(element)) {
          return true;
        }
        const target = event.target;
        return target instanceof Node && element.contains(target);
      });
    },
    nextTransitionGeneration(): number {
      transitionGeneration.update(value => value + 1);
      return transitionGeneration();
    },
  };

  return state;
}

export const [NgpDrawerStateToken, ngpDrawer, injectDrawerState, provideDrawerState] =
  createPrimitive('NgpDrawer', createDrawerState);

export function requireDrawerState(state: Signal<DrawerState | null>, part: string): DrawerState {
  const value = state();
  if (!value) {
    throw new Error(`${part} must be used inside ng-container[ngpDrawer].`);
  }
  return value;
}
