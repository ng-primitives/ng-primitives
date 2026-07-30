import { ElementRef } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive } from 'ng-primitives/state';

export interface NgpMenuTriggerGroupState {
  /**
   * The group's host element - the shared container a root NgpMenuTrigger
   * suppresses pointer-events on while a sibling's hover-bridge is active.
   * @internal
   */
  readonly element: ElementRef<HTMLElement>;
}

export interface NgpMenuTriggerGroupProps {}

export const [
  NgpMenuTriggerGroupStateToken,
  ngpMenuTriggerGroup,
  injectMenuTriggerGroupState,
  provideMenuTriggerGroupState,
] = createPrimitive('NgpMenuTriggerGroup', (_: NgpMenuTriggerGroupProps) => {
  const element = injectElementRef<HTMLElement>();

  return { element } satisfies NgpMenuTriggerGroupState;
});
