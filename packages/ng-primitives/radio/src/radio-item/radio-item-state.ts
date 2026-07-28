import { computed, Signal, signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  StateInjectionOptions,
} from 'ng-primitives/state';
import { injectRadioGroupState } from '../radio-group/radio-group-state';

/**
 * Public state surface for the RadioItem primitive.
 */
export interface NgpRadioItemState<T> {
  /**
   * The value of the radio item.
   */
  readonly value: Signal<T>;
  /**
   * Whether the radio item is disabled, either in its own right or because the
   * group it belongs to is disabled.
   */
  readonly disabled: Signal<boolean>;
  /**
   * Whether the radio item is checked.
   */
  readonly checked: Signal<boolean>;
}

/**
 * Inputs for configuring the RadioItem primitive.
 */
export interface NgpRadioItemProps<T> {
  /**
   * The value of the radio item.
   */
  readonly value: Signal<T>;
  /**
   * Whether the radio item is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [NgpRadioItemStateToken, ngpRadioItem, _injectRadioItemState, provideRadioItemState] =
  createPrimitive(
    'NgpRadioItem',
    <T>({
      value,
      disabled: _disabled = signal(false),
    }: NgpRadioItemProps<T>): NgpRadioItemState<T> => {
      const element = injectElementRef();
      const radioGroup = injectRadioGroupState<T>();

      const checked = computed(() => radioGroup().compareWith()(radioGroup().value(), value()));

      // A disabled group disables everything in it, so the item reflects both.
      const disabled = computed(() => _disabled() || radioGroup().disabled());

      // Setup interactions
      ngpInteractions({ hover: true, press: true, focusVisible: true, disabled });

      // Host bindings
      attrBinding(element, 'role', 'radio');
      attrBinding(element, 'aria-checked', () => (checked() ? 'true' : 'false'));
      attrBinding(element, 'aria-disabled', disabled);
      dataBinding(element, 'data-disabled', disabled);
      dataBinding(element, 'data-checked', checked);

      function select(): void {
        if (disabled()) {
          return;
        }

        radioGroup().select(value());
      }

      // Event listeners
      listener(element, 'focus', select);
      listener(element, 'click', select);

      return { value, disabled, checked } satisfies NgpRadioItemState<T>;
    },
  );

/**
 * Injects the RadioItem state.
 */
export function injectRadioItemState<T>(
  options?: StateInjectionOptions,
): Signal<NgpRadioItemState<T>> {
  return _injectRadioItemState(options) as Signal<NgpRadioItemState<T>>;
}
