import { computed, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, styleBinding } from 'ng-primitives/state';
import { injectNavigationMenuListState } from '../navigation-menu-list/navigation-menu-list-state';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';

/**
 * The state for the NgpNavigationMenuIndicator directive.
 */
export interface NgpNavigationMenuIndicatorState {
  /**
   * Whether the indicator is visible.
   */
  readonly visible: Signal<boolean>;

  /**
   * The position of the indicator.
   */
  readonly position: Signal<{ left: number; top: number; width: number; height: number } | null>;
}

export const [
  NgpNavigationMenuIndicatorStateToken,
  ngpNavigationMenuIndicator,
  injectNavigationMenuIndicatorState,
  provideNavigationMenuIndicatorState,
] = createPrimitive('NgpNavigationMenuIndicator', (): NgpNavigationMenuIndicatorState => {
  const element = injectElementRef();
  const menu = injectNavigationMenuState();
  const list = injectNavigationMenuListState();

  // Whether the indicator should be visible
  const visible = computed(() => menu().value() !== undefined);

  // Calculate position based on active trigger
  const position = computed<{ left: number; top: number; width: number; height: number } | null>(
    () => {
      const currentValue = menu().value();
      if (!currentValue) return null;

      const triggers = list().triggers();
      const activeTrigger = triggers.find(t => t.value() === currentValue);
      if (!activeTrigger) return null;

      const triggerElement = activeTrigger.element;
      const listElement = element.nativeElement.parentElement;

      if (!listElement) return null;

      const listRect = listElement.getBoundingClientRect();
      const triggerRect = triggerElement.getBoundingClientRect();

      // Account for border width since absolute positioning is relative to the padding edge
      const computedStyle = getComputedStyle(listElement);
      const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0;
      const borderTop = parseFloat(computedStyle.borderTopWidth) || 0;

      return {
        left: triggerRect.left - listRect.left - borderLeft,
        top: triggerRect.top - listRect.top - borderTop,
        width: triggerRect.width,
        height: triggerRect.height,
      };
    },
  );

  // Host bindings
  dataBinding(element, 'data-state', () => (visible() ? 'visible' : 'hidden'));
  dataBinding(element, 'data-orientation', menu().orientation);

  // Style bindings for position
  styleBinding(element, '--ngp-navigation-menu-indicator-left', () => {
    const pos = position();
    return pos ? `${pos.left}px` : null;
  });

  styleBinding(element, '--ngp-navigation-menu-indicator-top', () => {
    const pos = position();
    return pos ? `${pos.top}px` : null;
  });

  styleBinding(element, '--ngp-navigation-menu-indicator-width', () => {
    const pos = position();
    return pos ? `${pos.width}px` : null;
  });

  styleBinding(element, '--ngp-navigation-menu-indicator-height', () => {
    const pos = position();
    return pos ? `${pos.height}px` : null;
  });

  return {
    visible,
    position,
  } satisfies NgpNavigationMenuIndicatorState;
});
