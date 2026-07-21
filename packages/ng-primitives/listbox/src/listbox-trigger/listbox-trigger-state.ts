import { ElementRef } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { injectPopoverTriggerState } from 'ng-primitives/popover';
import { createPrimitive, listener } from 'ng-primitives/state';

export interface NgpListboxTriggerState {
  /** Access the component's reference. */
  readonly elementRef: ElementRef;
  /**
   * When the up or down arrow key is pressed, open the popover.
   */
  onPopover: (event: KeyboardEvent) => void;
}

export interface NgpListboxTriggerProps {}

export const [
  NgpListboxTriggerStateToken,
  ngpListboxTrigger,
  injectListboxTriggerState,
  provideListboxTriggerState,
] = createPrimitive('NgpListboxTrigger', ({}: NgpListboxTriggerProps) => {
  const elementRef = injectElementRef();
  const popoverTriggerState = injectPopoverTriggerState();

  // Listener
  listener(elementRef, 'keydown', handleOnKeydown);

  function handleOnKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      popoverTriggerState().show();
      event.preventDefault();
    }
  }

  return {
    elementRef,
    onPopover: handleOnKeydown,
  } satisfies NgpListboxTriggerState;
});
