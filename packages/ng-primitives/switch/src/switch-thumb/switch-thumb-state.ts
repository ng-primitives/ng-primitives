import { computed, Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding } from 'ng-primitives/state';
import { injectSwitchState } from '../switch/switch-state';

/**
 * Public state surface for the Switch Thumb primitive.
 */
export interface NgpSwitchThumbState {
  /**
   * Whether the switch is checked.
   */
  readonly checked: Signal<boolean>;
  /**
   * Whether the switch is disabled.
   */
  readonly disabled: Signal<boolean>;
}

/**
 * Inputs for configuring the Switch Thumb primitive.
 */
export interface NgpSwitchThumbProps {}

export const [
  NgpSwitchThumbStateToken,
  ngpSwitchThumb,
  injectSwitchThumbState,
  provideSwitchThumbState,
] = createPrimitive('NgpSwitchThumb', ({}: NgpSwitchThumbProps): NgpSwitchThumbState => {
  const element = injectElementRef();
  const switchState = injectSwitchState();

  const checked = computed(() => switchState().checked());
  const disabled = computed(() => switchState().disabled());

  // Host bindings
  dataBinding(element, 'data-checked', checked);
  dataBinding(element, 'data-disabled', disabled);

  ngpInteractions({
    hover: true,
    focusVisible: true,
    press: true,
    disabled,
  });

  return { checked, disabled };
});
