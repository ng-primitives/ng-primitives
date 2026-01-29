import { computed, signal, Signal } from '@angular/core';
import { createPrimitive } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectNavigationMenuItemState } from '../navigation-menu-item/navigation-menu-item-state';
import { injectNavigationMenuTriggerState } from '../navigation-menu-trigger/navigation-menu-trigger-state';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';

/**
 * Motion direction for animations.
 */
export type NgpNavigationMenuMotionDirection = 'to-start' | 'to-end' | 'from-start' | 'from-end';

/**
 * The state for the NgpNavigationMenuContent directive.
 */
export interface NgpNavigationMenuContentState {
  /**
   * The unique id for the content.
   */
  readonly id: Signal<string>;

  /**
   * Whether the content is open.
   */
  readonly open: Signal<boolean>;

  /**
   * The motion direction for animations.
   */
  readonly motionDirection: Signal<NgpNavigationMenuMotionDirection | undefined>;
}

export const [
  NgpNavigationMenuContentStateToken,
  ngpNavigationMenuContent,
  injectNavigationMenuContentState,
  provideNavigationMenuContentState,
] = createPrimitive('NgpNavigationMenuContent', (): NgpNavigationMenuContentState => {
  const menu = injectNavigationMenuState();
  const item = injectNavigationMenuItemState();

  const id = signal(uniqueId('ngp-navigation-menu-content'));

  // Whether this content is open
  const open = computed(() => item().open());

  // Calculate motion direction based on previous and current value
  const motionDirection = computed<NgpNavigationMenuMotionDirection | undefined>(() => {
    const currentValue = menu().value();
    const previousValue = menu().previousValue();
    const thisValue = item().value();

    if (!currentValue || !previousValue) {
      return undefined;
    }

    const items = menu().items();
    const currentIndex = items.findIndex(i => i.value() === currentValue);
    const previousIndex = items.findIndex(i => i.value() === previousValue);

    if (currentIndex === -1 || previousIndex === -1) {
      return undefined;
    }

    const isMovingForward = currentIndex > previousIndex;

    // If this content is the one being opened
    if (thisValue === currentValue) {
      return isMovingForward ? 'from-end' : 'from-start';
    }

    // If this content is the one being closed
    if (thisValue === previousValue) {
      return isMovingForward ? 'to-start' : 'to-end';
    }

    return undefined;
  });

  return {
    id,
    open,
    motionDirection,
  } satisfies NgpNavigationMenuContentState;
});
