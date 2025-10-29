import {
  computed,
  ElementRef,
  FactoryProvider,
  HOST_TAG_NAME,
  inject,
  InjectionToken,
  linkedSignal,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { ngpFormControlPattern } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createStateInjectFn,
  dataBinding,
  listener,
  onPress,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';

/**
 * The state interface for the Switch pattern.
 */
export interface NgpSwitchState {
  /**
   * The checked state.
   */
  checked: Signal<boolean>;
  /**
   * The disabled state.
   */
  disabled: Signal<boolean>;
  /**
   * Toggle method.
   */
  toggle: () => void;
  /**
   * Set the checked state.
   */
  setChecked: (value: boolean) => void;
  /**
   * Set the disabled state.
   */
  setDisabled: (value: boolean) => void;
}

/**
 * The props interface for the Switch pattern.
 */
export interface NgpSwitchProps {
  /**
   * The element reference for the switch.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Id signal input.
   */
  readonly id?: Signal<string>;
  /**
   * Checked signal input.
   */
  readonly checked?: Signal<boolean>;
  /**
   * Disabled signal input.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Event listener for checkedChange events.
   */
  readonly onCheckedChange?: (value: boolean) => void;
}

/**
 * The Switch pattern function.
 */
export function ngpSwitchPattern({
  element = injectElementRef(),
  id = signal(uniqueId('ngp-switch')),
  checked: _checked = signal(false),
  disabled: _disabled = signal(false),
  onCheckedChange,
}: NgpSwitchProps = {}): NgpSwitchState {
  const tag = inject(HOST_TAG_NAME).toLowerCase();
  const isButton = tag === 'button';
  const checked = controlled(_checked);
  const disabled = controlled(_disabled);

  // Host bindings
  attrBinding(element, 'role', 'switch');
  attrBinding(element, 'id', id);
  attrBinding(element, 'aria-checked', checked);
  attrBinding(element, 'aria-disabled', disabled);
  dataBinding(element, 'data-checked', checked);
  dataBinding(element, 'data-disabled', disabled);
  attrBinding(
    element,
    'tabindex',
    computed(() => (disabled() ? -1 : 0)),
  );

  if (isButton) {
    attrBinding(element, 'type', 'button');
    attrBinding(element, 'disabled', disabled);
  }

  // Interactions
  ngpInteractions({
    hover: true,
    press: true,
    focusVisible: true,
    disabled,
    element,
  });

  // Form control setup
  ngpFormControlPattern({ id, disabled, element });

  // Host listeners
  listener(element, 'click', toggle);
  onPress(element, ' ', onKeyDown);

  // Method implementations
  function toggle(): void {
    if (disabled()) {
      return;
    }

    const newChecked = !checked();
    checked.set(newChecked);
    onCheckedChange?.(newChecked);
  }

  function setChecked(value: boolean): void {
    checked.set(value);
  }

  function setDisabled(value: boolean): void {
    disabled.set(value);
  }

  function onKeyDown(event: KeyboardEvent): void {
    // Prevent the default action of the space key, which is to scroll the page.
    event.preventDefault();

    // If the switch is not a button then the space key will not toggle the checked state automatically,
    // so we need to do it manually.
    if (!isButton) {
      toggle();
    }
  }

  return {
    checked,
    disabled,
    toggle,
    setChecked,
    setDisabled,
  };
}

/**
 * The injection token for the Switch pattern.
 */
export const NgpSwitchPatternToken = new InjectionToken<NgpSwitchState>('NgpSwitchPatternToken');

/**
 * Injects the Switch pattern.
 */
export function injectSwitchPattern(): NgpSwitchState {
  return inject(NgpSwitchPatternToken);
}

/**
 * Provides the Switch pattern.
 */
export function provideSwitchPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpSwitchState,
): FactoryProvider {
  return { provide: NgpSwitchPatternToken, useFactory: () => fn(inject(type)) };
}

/**
 * @deprecated use `injectSwitchPattern` instead.
 */
export const injectSwitchState = createStateInjectFn(injectSwitchPattern, pattern => {
  const checked = linkedSignal(pattern.checked);
  checked.set = pattern.setChecked;

  const disabled = linkedSignal(pattern.disabled);
  disabled.set = pattern.setDisabled;

  return { ...pattern, disabled, checked, checkedChange: toObservable(checked) };
});
