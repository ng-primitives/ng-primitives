import { computed, Signal, signal } from '@angular/core';
import {
  createHoverTransitTracker,
  HoverTransitTracker,
  injectElementRef,
} from 'ng-primitives/internal';
import { createPrimitive } from 'ng-primitives/state';

export interface NgpMenuTriggerGroupState extends HoverTransitTracker {
  /**
   * The shared container a root NgpMenuTrigger suppresses pointer-events on
   * while its hover bridge is active, or null while sibling tracking is off.
   * @internal
   */
  readonly siblingContainer: Signal<HTMLElement | null>;
}

export interface NgpMenuTriggerGroupProps {
  /** Whether the group coordinates hover between its sibling triggers. */
  siblingTracking?: Signal<boolean>;
}

export const [
  NgpMenuTriggerGroupStateToken,
  ngpMenuTriggerGroup,
  injectMenuTriggerGroupState,
  provideMenuTriggerGroupState,
] = createPrimitive(
  'NgpMenuTriggerGroup',
  ({ siblingTracking = signal(true) }: NgpMenuTriggerGroupProps) => {
    const element = injectElementRef<HTMLElement>();
    const tracker = createHoverTransitTracker();

    // Only read when a corridor starts, so switching tracking off takes effect
    // from the next transit rather than stranding one already in flight.
    const siblingContainer = computed(() => (siblingTracking() ? element.nativeElement : null));

    return {
      siblingContainer,
      ...tracker,
      // A trigger that never suppressed its siblings must not decline their
      // hovers either, or they would be inert with nothing to release them.
      isTransitBlocked: trigger => siblingTracking() && tracker.isTransitBlocked(trigger),
    } satisfies NgpMenuTriggerGroupState;
  },
);
