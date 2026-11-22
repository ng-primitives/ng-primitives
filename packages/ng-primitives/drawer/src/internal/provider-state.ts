import { computed, inject, signal } from '@angular/core';
import { createPrimitive } from 'ng-primitives/state';
import { DrawerStackService } from './drawer-stack.service';
import { DrawerState } from './drawer-state';
import { DrawerVisualState } from './visual-state-store';

export interface DrawerProviderVisualSnapshot {
  readonly frontmostHeight: number;
  readonly nestedDrawers: number;
  readonly swipeProgress: number;
}

export function createDrawerProviderState() {
  const stack = inject(DrawerStackService);
  const roots = new Set<DrawerState>();
  const subscriptions = new Map<DrawerState, () => void>();
  const snapshots = new Map<DrawerState, Readonly<DrawerVisualState>>();
  const listeners = new Set<() => void>();
  const version = signal(0);

  const openRoots = (): DrawerState[] => [...roots].filter(root => root.open());
  const notify = (): void => {
    version.update(value => value + 1);
    for (const listener of listeners) {
      listener();
    }
  };

  const getVisualSnapshot = (): DrawerProviderVisualSnapshot => {
    const open = openRoots();
    // `roots` is ordered by registration, which is not the painting order: the frontmost drawer is
    // the one activated last, so the stack decides and registration order is only the fallback for
    // a drawer that is open but not yet attached.
    const frontmost = stack.frontmost(open) ?? open.at(-1);
    return {
      frontmostHeight: frontmost?.frontmostHeight() ?? 0,
      nestedDrawers: open.length,
      swipeProgress: frontmost ? (snapshots.get(frontmost)?.progress ?? 0) : 0,
    };
  };

  return {
    anyOpen: computed(() => {
      version();
      return openRoots().length > 0;
    }),
    openCount: computed(() => {
      version();
      return openRoots().length;
    }),
    frontmostHeight: computed(() => {
      version();
      return getVisualSnapshot().frontmostHeight;
    }),
    swiping: computed(() => {
      version();
      return openRoots().some(root => root.swiping());
    }),
    getVisualSnapshot,
    subscribeVisual(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    register(root: DrawerState): () => void {
      roots.add(root);
      snapshots.set(root, root.visualStore.getSnapshot());
      subscriptions.set(
        root,
        root.visualStore.subscribe(snapshot => {
          snapshots.set(root, snapshot);
          notify();
        }),
      );
      notify();
      return () => {
        subscriptions.get(root)?.();
        subscriptions.delete(root);
        snapshots.delete(root);
        roots.delete(root);
        notify();
      };
    },
  };
}

export type DrawerProviderState = ReturnType<typeof createDrawerProviderState>;

export const [
  NgpDrawerProviderStateToken,
  ngpDrawerProvider,
  injectDrawerProviderState,
  provideDrawerProviderState,
] = createPrimitive('NgpDrawerProvider', createDrawerProviderState);
