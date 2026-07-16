import {
  afterRenderEffect,
  computed,
  DestroyRef,
  ElementRef,
  signal,
  untracked,
} from '@angular/core';
import { DrawerState } from './drawer-state';

interface NestedVisualSnapshot {
  readonly nestedDrawers: string;
  readonly frontmostHeight: string;
  readonly swipeProgress: string;
}

interface NestedVisualState {
  readonly count: number;
  readonly present: boolean;
  readonly popupHeight: number;
  readonly frontmostHeight: number;
}

interface NestedVisualRenderState extends NestedVisualState {
  readonly snapshot: NestedVisualSnapshot | null;
}

export function bindDrawerNestedVisuals(
  elementRef: ElementRef<HTMLElement>,
  state: DrawerState,
  destroyRef: DestroyRef,
): void {
  const element = elementRef.nativeElement;
  const snapshotState = signal<NestedVisualSnapshot | null>(null);
  let unsubscribe: (() => void) | undefined;
  let retainedHeight: string | null = null;
  const visualState = computed<NestedVisualState>(() => ({
    count: state.nestedCount(),
    present: state.nestedPresent(),
    popupHeight: state.popupHeight(),
    frontmostHeight: state.frontmostHeight(),
  }));
  const renderState = computed<NestedVisualRenderState>(() => ({
    ...visualState(),
    snapshot: snapshotState(),
  }));

  afterRenderEffect({
    earlyRead: () => {
      const snapshot = snapshotState();
      if (snapshot) {
        return;
      }
      snapshotState.set(untracked(() => captureSnapshot(element)));
    },
  });
  afterRenderEffect({
    write: () => {
      const value = renderState();
      const snapshot = value.snapshot;
      if (!snapshot) {
        return;
      }
      untracked(() => {
        if (value.present && value.popupHeight > 0) {
          retainedHeight ??= element.style.getPropertyValue('--ngp-drawer-height');
          element.style.setProperty('--ngp-drawer-height', `${value.popupHeight}px`);
        } else if (retainedHeight !== null) {
          restoreProperty(element, '--ngp-drawer-height', retainedHeight);
          retainedHeight = null;
        }
        applyRenderState(element, value);
        const syncProgress = (): void => {
          const progress = state.nestedVisualStore.getSnapshot().progress;
          setOrRestore(
            element,
            '--ngp-drawer-swipe-progress',
            progress > 0 ? String(progress) : '',
            snapshot.swipeProgress,
          );
        };
        syncProgress();
        unsubscribe ??= state.nestedVisualStore.subscribe(syncProgress);
      });
    },
  });
  destroyRef.onDestroy(() => {
    unsubscribe?.();
    if (retainedHeight !== null) {
      restoreProperty(element, '--ngp-drawer-height', retainedHeight);
    }
    const snapshot = untracked(snapshotState);
    if (snapshot) {
      restoreProperty(element, '--ngp-drawer-nested-drawers', snapshot.nestedDrawers);
      restoreProperty(element, '--ngp-drawer-frontmost-height', snapshot.frontmostHeight);
      restoreProperty(element, '--ngp-drawer-swipe-progress', snapshot.swipeProgress);
    }
  });
}

function captureSnapshot(element: HTMLElement): NestedVisualSnapshot {
  return {
    nestedDrawers: element.style.getPropertyValue('--ngp-drawer-nested-drawers'),
    frontmostHeight: element.style.getPropertyValue('--ngp-drawer-frontmost-height'),
    swipeProgress: element.style.getPropertyValue('--ngp-drawer-swipe-progress'),
  };
}

function applyRenderState(element: HTMLElement, renderState: NestedVisualRenderState): void {
  const snapshot = renderState.snapshot;
  if (!snapshot) {
    return;
  }
  const height = renderState.present ? renderState.frontmostHeight : 0;
  setOrRestore(
    element,
    '--ngp-drawer-nested-drawers',
    renderState.count > 0 ? String(renderState.count) : '',
    snapshot.nestedDrawers,
  );
  setOrRestore(
    element,
    '--ngp-drawer-frontmost-height',
    height > 0 ? `${height}px` : '',
    snapshot.frontmostHeight,
  );
}

function setOrRestore(
  element: HTMLElement,
  property: string,
  value: string,
  fallback: string,
): void {
  restoreProperty(element, property, value || fallback);
}

function restoreProperty(element: HTMLElement, property: string, value: string): void {
  if (value) {
    element.style.setProperty(property, value);
  } else {
    element.style.removeProperty(property);
  }
}
