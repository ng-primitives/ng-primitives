import { computed, HOST_TAG_NAME, inject, signal, Signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
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
  /**
   * Sets `aria-disabled` on the trigger while true, for an owner that refuses
   * the toggle. The trigger stays focusable and does not block the click itself.
   * @internal
   */
  readonly ariaDisabled?: Signal<boolean>;
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
    ariaDisabled = signal(false),
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
    // aria-disabled rather than disabled, so the trigger stays focusable and is announced.
    const announcedDisabled = computed(() => collapsible().disabled() || ariaDisabled());
    // An ngpButton on the same element binds aria-disabled too, so feed it rather than compete.
    const button = inject(NgpButton, { self: true, optional: true });

    if (button) {
      button.registerAriaDisabledSource(announcedDisabled);
      onDestroy(() => button.unregisterAriaDisabledSource(announcedDisabled));
    } else {
      attrBinding(element, 'aria-disabled', () => (announcedDisabled() ? 'true' : null));
    }
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
