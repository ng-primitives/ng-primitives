import { computed, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, onDestroy, onMount, styleBinding } from 'ng-primitives/state';
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
}

export const [
  NgpNavigationMenuViewportStateToken,
  ngpNavigationMenuViewport,
  injectNavigationMenuViewportState,
  provideNavigationMenuViewportState,
] = createPrimitive(
  'NgpNavigationMenuViewport',
  (): NgpNavigationMenuViewportState => {
    const element = injectElementRef();
    const menu = injectNavigationMenuState();

    // Track content dimensions
    const width = signal<number | null>(null);
    const height = signal<number | null>(null);

    // Whether any content is open
    const open = computed(() => menu().value() !== undefined);

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

    return {
      width,
      height,
      open,
    } satisfies NgpNavigationMenuViewportState;
  },
);
