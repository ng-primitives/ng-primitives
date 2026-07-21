import { injectElementRef } from 'ng-primitives/internal';
import { injectPopoverTriggerState } from 'ng-primitives/popover';
import { createPrimitive, listener } from 'ng-primitives/state';

export type NgpListboxTriggerState = Record<string, never>;

export type NgpListboxTriggerProps = Record<string, never>;

export const [
  NgpListboxTriggerStateToken,
  ngpListboxTrigger,
  injectListboxTriggerState,
  provideListboxTriggerState,
] = createPrimitive('NgpListboxTrigger', () => {
  const elementRef = injectElementRef();
  const popoverTriggerState = injectPopoverTriggerState();

  // When the up or down arrow key is pressed, open the popover.
  listener(elementRef, 'keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      popoverTriggerState().show();
      event.preventDefault();
    }
  });

  return {} satisfies NgpListboxTriggerState;
});
