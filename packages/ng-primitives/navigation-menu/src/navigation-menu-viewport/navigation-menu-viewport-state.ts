import { computed, inject, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpOverlay } from 'ng-primitives/portal';
import {
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
  onMount,
  styleBinding,
} from 'ng-primitives/state';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';

/**
 * The state for the NgpNavigationMenuViewport directive.
 */
export interface NgpNavigationMenuViewportState {
  /**
   * The width of the active content.
   */
  readonly width: Signal<number | null>;

  /**
   * The height of the active content.
   */
  readonly height: Signal<number | null>;

  /**
   * Whether any content is open.
   */
  readonly open: Signal<boolean>;

  /**
   * The position of the active trigger relative to the menu.
   */
  readonly triggerPosition: Signal<{ left: number; top: number } | null>;
}

export const [
  NgpNavigationMenuViewportStateToken,
  ngpNavigationMenuViewport,
  injectNavigationMenuViewportState,
  provideNavigationMenuViewportState,
] = createPrimitive('NgpNavigationMenuViewport', (): NgpNavigationMenuViewportState => {
  const element = injectElementRef();
  const menu = injectNavigationMenuState();

  // Optionally inject the overlay when inside a portal
  const overlay = inject(NgpOverlay, { optional: true });

  // Track content dimensions
  const width = signal<number | null>(null);
  const height = signal<number | null>(null);

  // Whether any content is open
  const open = computed(() => menu().value() !== undefined);

  // Calculate position of the active trigger relative to the menu
  const triggerPosition = computed<{ left: number; top: number } | null>(() => {
    const currentValue = menu().value();
    if (!currentValue) return null;

    const items = menu().items();
    const activeItem = items.find(item => item.value() === currentValue);
    if (!activeItem) return null;

    const triggerElement = activeItem.triggerElement();
    if (!triggerElement) return null;

    // Get the menu element (parent of the viewport's parent container)
    const viewportElement = element.nativeElement;
    const menuElement = viewportElement.closest('[ngpNavigationMenu]');
    if (!menuElement) return null;

    const menuRect = menuElement.getBoundingClientRect();
    const triggerRect = triggerElement.getBoundingClientRect();

    return {
      left: triggerRect.left - menuRect.left,
      top: triggerRect.top - menuRect.top,
    };
  });

  // Register viewport with menu
  onMount(() => {
    menu().registerViewport({
      element: element.nativeElement,
      updateDimensions: (w: number, h: number) => {
        width.set(w);
        height.set(h);
      },
    });
  });

  onDestroy(() => {
    menu().registerViewport(null);
  });

  // Host bindings
  dataBinding(element, 'data-state', () => (open() ? 'open' : 'closed'));
  dataBinding(element, 'data-orientation', menu().orientation);

  // CSS variables for dimensions
  styleBinding(element, '--ngp-navigation-menu-viewport-width', () => {
    const w = width();
    return w !== null ? `${w}px` : null;
  });

  styleBinding(element, '--ngp-navigation-menu-viewport-height', () => {
    const h = height();
    return h !== null ? `${h}px` : null;
  });

  // CSS variables for trigger position (useful for vertical menus)
  styleBinding(element, '--ngp-navigation-menu-viewport-left', () => {
    const pos = triggerPosition();
    return pos !== null ? `${pos.left}px` : null;
  });

  styleBinding(element, '--ngp-navigation-menu-viewport-top', () => {
    const pos = triggerPosition();
    return pos !== null ? `${pos.top}px` : null;
  });

  // When inside a portal overlay, apply floating-ui positioning
  if (overlay) {
    styleBinding(element, 'position', () => 'absolute');
    styleBinding(element, 'left', () => {
      const x = overlay.position().x;
      return x !== undefined ? `${x}px` : null;
    });
    styleBinding(element, 'top', () => {
      const y = overlay.position().y;
      return y !== undefined ? `${y}px` : null;
    });
  }

  // Pointer event handlers - cancel close timer when hovering viewport
  listener(element, 'pointerenter', () => {
    menu().cancelCloseTimer();
  });

  listener(element, 'pointerleave', () => {
    menu().startCloseTimer();
  });

  return {
    width,
    height,
    open,
    triggerPosition,
  } satisfies NgpNavigationMenuViewportState;
});
