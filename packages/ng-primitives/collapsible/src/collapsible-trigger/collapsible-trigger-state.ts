import { HOST_TAG_NAME, inject, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectCollapsibleState } from '../collapsible/collapsible-state';

export interface NgpCollapsibleTriggerState {
  /**
   * The id of the trigger.
   */
  readonly id: Signal<string>;
  /**
   * Toggle the collapsible.
   */
  toggle(): void;
}

export interface NgpCollapsibleTriggerProps {
  /**
   * The id of the trigger.
   */
  readonly id?: Signal<string>;
}

export const [
  NgpCollapsibleTriggerStateToken,
  ngpCollapsibleTrigger,
  injectCollapsibleTriggerState,
  provideCollapsibleTriggerState,
] = createPrimitive(
  'NgpCollapsibleTrigger',
  ({
    id = signal(uniqueId('ngp-collapsible-trigger')),
  }: NgpCollapsibleTriggerProps): NgpCollapsibleTriggerState => {
    const element = injectElementRef<HTMLElement>();
    const tagName = inject(HOST_TAG_NAME);
    const collapsible = injectCollapsibleState();

    // Host bindings
    attrBinding(element, 'id', id);
    attrBinding(element, 'type', tagName === 'button' ? 'button' : null);
    attrBinding(element, 'aria-controls', collapsible().contentId);
    attrBinding(element, 'aria-expanded', collapsible().open);
    dataBinding(element, 'data-open', collapsible().open);
    dataBinding(element, 'data-closed', () => !collapsible().open());
    dataBinding(element, 'data-disabled', collapsible().disabled);
    dataBinding(element, 'data-orientation', collapsible().orientation);

    // Register the trigger with the collapsible state
    collapsible().setTrigger(id());

    // The disabled guard lives in the collapsible state's toggle().
    function toggle(): void {
      collapsible().toggle();
    }

    listener(element, 'click', toggle);

    return { id, toggle } satisfies NgpCollapsibleTriggerState;
  },
);
