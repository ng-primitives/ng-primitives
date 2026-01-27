import { computed, signal, Signal } from '@angular/core';
import { Placement } from '@floating-ui/dom';
import { injectElementRef } from 'ng-primitives/internal';
import { NgpOffset, NgpShift } from 'ng-primitives/portal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
  onMount,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectNavigationMenuItemState } from '../navigation-menu-item/navigation-menu-item-state';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';
import { injectNavigationMenuTriggerState } from '../navigation-menu-trigger/navigation-menu-trigger-state';

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
   * The placement of the content.
   */
  readonly placement: Signal<Placement>;

  /**
   * The offset of the content.
   */
  readonly offset: Signal<NgpOffset>;

  /**
   * Whether to flip the content when there is not enough space.
   */
  readonly flip: Signal<boolean>;

  /**
   * The shift configuration.
   */
  readonly shift: Signal<NgpShift>;

  /**
   * The motion direction for animations.
   */
  readonly motionDirection: Signal<NgpNavigationMenuMotionDirection | undefined>;

  /**
   * Set the placement.
   */
  setPlacement(placement: Placement): void;

  /**
   * Set the offset.
   */
  setOffset(offset: NgpOffset): void;

  /**
   * Set whether to flip.
   */
  setFlip(flip: boolean): void;

  /**
   * Set the shift configuration.
   */
  setShift(shift: NgpShift): void;
}

export interface NgpNavigationMenuContentProps {
  /**
   * The placement of the content.
   */
  readonly placement?: Signal<Placement>;

  /**
   * The offset of the content.
   */
  readonly offset?: Signal<NgpOffset>;

  /**
   * Whether to flip the content.
   */
  readonly flip?: Signal<boolean>;

  /**
   * The shift configuration.
   */
  readonly shift?: Signal<NgpShift>;
}

export const [
  NgpNavigationMenuContentStateToken,
  ngpNavigationMenuContent,
  injectNavigationMenuContentState,
  provideNavigationMenuContentState,
] = createPrimitive(
  'NgpNavigationMenuContent',
  ({
    placement: _placement = signal('bottom'),
    offset: _offset = signal(0),
    flip: _flip = signal(true),
    shift: _shift = signal(true),
  }: NgpNavigationMenuContentProps): NgpNavigationMenuContentState => {
    const element = injectElementRef();
    const menu = injectNavigationMenuState();
    const item = injectNavigationMenuItemState();
    const trigger = injectNavigationMenuTriggerState({ optional: true });

    const id = signal(uniqueId('ngp-navigation-menu-content'));
    const placement = controlled(_placement);
    const offset = controlled(_offset);
    const flip = controlled(_flip);
    const shift = controlled(_shift);

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

    // Register content element with item
    onMount(() => {
      item().setContentElement(element.nativeElement);

      // Set content id on trigger for aria-controls
      const triggerState = trigger?.();
      if (triggerState) {
        triggerState.setContentId(id());
      }
    });

    onDestroy(() => {
      item().setContentElement(null);

      const triggerState = trigger?.();
      if (triggerState) {
        triggerState.setContentId(undefined);
      }
    });

    // Host bindings
    attrBinding(element, 'id', id);
    dataBinding(element, 'data-state', () => (open() ? 'open' : 'closed'));
    dataBinding(element, 'data-orientation', menu().orientation);
    dataBinding(element, 'data-motion', () => motionDirection() ?? null);

    // Event handlers - cancel close timer when pointer enters content
    listener(element, 'pointerenter', onPointerEnter);
    listener(element, 'pointerleave', onPointerLeave);

    function onPointerEnter(): void {
      menu().cancelCloseTimer();
    }

    function onPointerLeave(): void {
      menu().startCloseTimer();
    }

    function setPlacement(value: Placement): void {
      placement.set(value);
    }

    function setOffset(value: NgpOffset): void {
      offset.set(value);
    }

    function setFlip(value: boolean): void {
      flip.set(value);
    }

    function setShift(value: NgpShift): void {
      shift.set(value);
    }

    return {
      id,
      open,
      placement,
      offset,
      flip,
      shift,
      motionDirection,
      setPlacement,
      setOffset,
      setFlip,
      setShift,
    } satisfies NgpNavigationMenuContentState;
  },
);
