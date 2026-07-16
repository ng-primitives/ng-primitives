import {
  afterRenderEffect,
  computed,
  DestroyRef,
  ElementRef,
  signal,
  untracked,
} from '@angular/core';
import { DrawerProviderState } from './provider-state';

interface IndentSnapshot {
  readonly active: string | null;
  readonly inactive: string | null;
  readonly nestedDrawers: string;
  readonly height: string;
  readonly frontmostHeight: string;
  readonly swipeProgress: string;
}

interface IndentVisualState {
  readonly active: boolean;
  readonly count: number;
  readonly height: number;
}

interface IndentRenderState extends IndentVisualState {
  readonly snapshot: IndentSnapshot | null;
}

export function bindDrawerIndentVisuals(
  elementRef: ElementRef<HTMLElement>,
  provider: DrawerProviderState | null,
  destroyRef: DestroyRef,
): void {
  const element = elementRef.nativeElement;
  const snapshotState = signal<IndentSnapshot | null>(null);
  let unsubscribe: (() => void) | undefined;
  const visualState = computed<IndentVisualState>(() => ({
    active: provider?.anyOpen() ?? false,
    count: provider?.openCount() ?? 0,
    height: provider?.frontmostHeight() ?? 0,
  }));
  const renderState = computed<IndentRenderState>(() => ({
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
      const state = renderState();
      if (!state.snapshot) {
        return;
      }
      untracked(() => {
        applyRenderState(element, state);
        const syncProgress = (): void => {
          const progress = provider?.getVisualSnapshot().swipeProgress ?? 0;
          element.style.setProperty('--ngp-drawer-swipe-progress', String(Math.max(0, progress)));
        };
        syncProgress();
        unsubscribe ??= provider?.subscribeVisual(syncProgress);
      });
    },
  });

  destroyRef.onDestroy(() => {
    unsubscribe?.();
    const snapshot = untracked(snapshotState);
    if (snapshot) {
      restoreAttribute(element, 'data-active', snapshot.active);
      restoreAttribute(element, 'data-inactive', snapshot.inactive);
      restoreProperty(element, '--ngp-drawer-nested-drawers', snapshot.nestedDrawers);
      restoreProperty(element, '--ngp-drawer-height', snapshot.height);
      restoreProperty(element, '--ngp-drawer-frontmost-height', snapshot.frontmostHeight);
      restoreProperty(element, '--ngp-drawer-swipe-progress', snapshot.swipeProgress);
    }
  });
}

function captureSnapshot(element: HTMLElement): IndentSnapshot {
  return {
    active: element.getAttribute('data-active'),
    inactive: element.getAttribute('data-inactive'),
    nestedDrawers: element.style.getPropertyValue('--ngp-drawer-nested-drawers'),
    height: element.style.getPropertyValue('--ngp-drawer-height'),
    frontmostHeight: element.style.getPropertyValue('--ngp-drawer-frontmost-height'),
    swipeProgress: element.style.getPropertyValue('--ngp-drawer-swipe-progress'),
  };
}

function applyRenderState(element: HTMLElement, renderState: IndentRenderState): void {
  toggleAttribute(element, 'data-active', renderState.active);
  toggleAttribute(element, 'data-inactive', !renderState.active);
  writeProperty(
    element,
    '--ngp-drawer-nested-drawers',
    renderState.count > 0 ? String(renderState.count) : '',
  );
  writeProperty(
    element,
    '--ngp-drawer-height',
    renderState.height > 0 ? `${renderState.height}px` : '',
  );
  writeProperty(
    element,
    '--ngp-drawer-frontmost-height',
    renderState.height > 0 ? `${renderState.height}px` : '',
  );
}

function toggleAttribute(element: HTMLElement, attribute: string, present: boolean): void {
  if (present) {
    element.setAttribute(attribute, '');
  } else {
    element.removeAttribute(attribute);
  }
}

function writeProperty(element: HTMLElement, property: string, value: string): void {
  if (value) {
    element.style.setProperty(property, value);
  } else {
    element.style.removeProperty(property);
  }
}

function restoreAttribute(element: HTMLElement, attribute: string, value: string | null): void {
  if (value === null) {
    element.removeAttribute(attribute);
  } else {
    element.setAttribute(attribute, value);
  }
}

function restoreProperty(element: HTMLElement, property: string, value: string): void {
  if (value) {
    element.style.setProperty(property, value);
  } else {
    element.style.removeProperty(property);
  }
}
