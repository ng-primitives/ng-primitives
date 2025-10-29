import {
  computed,
  ElementRef,
  FactoryProvider,
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
  onClick,
  onPress,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';

/**
 * The state interface for the Checkbox pattern.
 */
export interface NgpCheckboxState {
  /**
   * The checked state of the checkbox.
   */
  readonly checked: Signal<boolean>;
  /**
   * The indeterminate state of the checkbox.
   */
  readonly indeterminate: Signal<boolean>;
  /**
   * The disabled state of the checkbox.
   */
  readonly disabled: Signal<boolean>;
  /**
   * Toggle method.
   */
  toggle: () => void;
  /**
   * Set the checked state
   */
  setChecked: (value: boolean) => void;
  /**
   * Set the indeterminate state
   */
  setIndeterminate: (value: boolean) => void;

  /**
   * Set the disabled state
   */
  setDisabled: (value: boolean) => void;
}

/**
 * The props interface for the Checkbox pattern.
 */
export interface NgpCheckboxProps {
  /**
   * The element reference for the checkbox.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Id signal input.
   */
  readonly id?: Signal<any>;
  /**
   * Checked signal input.
   */
  readonly checked?: Signal<boolean>;
  /**
   * Indeterminate signal input.
   */
  readonly indeterminate?: Signal<boolean>;
  /**
   * Required signal input.
   */
  readonly required?: Signal<boolean>;
  /**
   * Disabled signal input.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Event listener for checkedChange events.
   */
  readonly onCheckedChange?: (value: boolean) => void;
  /**
   * Event listener for indeterminateChange events.
   */
  readonly onIndeterminateChange?: (value: boolean) => void;
}

/**
 * The Checkbox pattern function.
 */
export function ngpCheckboxPattern({
  element = injectElementRef(),
  id = signal(uniqueId('ngp-checkbox')),
  checked: _checked = signal(false),
  indeterminate: _indeterminate = signal(false),
  disabled: _disabled = signal(false),
  onCheckedChange,
  onIndeterminateChange,
}: NgpCheckboxProps = {}): NgpCheckboxState {
  const checked = controlled(_checked);
  const indeterminate = controlled(_indeterminate);
  const disabled = controlled(_disabled);

  // Host bindings
  attrBinding(element, 'role', 'checkbox');
  attrBinding(
    element,
    'aria-checked',
    computed(() => (indeterminate() ? 'mixed' : checked())),
  );
  dataBinding(element, 'data-checked', checked);
  dataBinding(element, 'data-indeterminate', indeterminate);
  attrBinding(element, 'aria-disabled', disabled);
  attrBinding(
    element,
    'tabindex',
    computed(() => (disabled() ? -1 : 0)),
  );

  ngpFormControlPattern({ id, disabled, element });

  ngpInteractions({
    hover: true,
    press: true,
    focusVisible: true,
    disabled,
    element,
  });

  // Interactions
  onPress(element, 'Enter', onEnter);
  onPress(element, ' ', event => {
    // prevent this firing twice in cases where the label is clicked and the checkbox is clicked by the one event
    event?.preventDefault();
    toggle();
  });
  onClick(element, toggle);

  // Method implementations
  function onEnter(event: KeyboardEvent): void {
    // According to WAI ARIA, Checkboxes don't activate on enter keypress
    event.preventDefault();
  }

  function setChecked(value: boolean): void {
    checked.set(value);
    onCheckedChange?.(value);
  }

  function setIndeterminate(value: boolean): void {
    indeterminate.set(value);
    onIndeterminateChange?.(value);
  }

  function toggle(): void {
    if (disabled()) {
      return;
    }

    const value = indeterminate() ? true : !checked();
    checked.set(value);
    onCheckedChange?.(value);

    // if the checkbox was indeterminate, it isn&#39;t anymore
    if (indeterminate()) {
      indeterminate.set(false);
      onIndeterminateChange?.(false);
    }
  }

  function setDisabled(value: boolean): void {
    disabled.set(value);
  }

  return {
    checked,
    indeterminate,
    disabled,
    toggle,
    setChecked,
    setIndeterminate,
    setDisabled,
  };
}

/**
 * The injection token for the Checkbox pattern.
 */
export const NgpCheckboxPatternToken = new InjectionToken<NgpCheckboxState>(
  'NgpCheckboxPatternToken',
);

/**
 * Injects the Checkbox pattern.
 */
export function injectCheckboxPattern(): NgpCheckboxState {
  return inject(NgpCheckboxPatternToken);
}

/**
 * Provides the Checkbox pattern.
 */
export function provideCheckboxPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpCheckboxState,
): FactoryProvider {
  return { provide: NgpCheckboxPatternToken, useFactory: () => fn(inject(type)) };
}

/**
 * @deprecated Use injectCheckboxPattern instead.
 */
export const injectCheckboxState = createStateInjectFn(injectCheckboxPattern, pattern => {
  // wrap the checked and indeterminate signals to provide set methods
  const checked = linkedSignal(pattern.checked);
  const indeterminate = linkedSignal(pattern.indeterminate);
  const disabled = linkedSignal(pattern.disabled);

  checked.set = pattern.setChecked;
  indeterminate.set = pattern.setIndeterminate;
  disabled.set = pattern.setDisabled;

  return {
    ...pattern,
    checked,
    indeterminate,
    disabled,
    checkedChange: toObservable(pattern.checked),
    indeterminateChange: toObservable(pattern.indeterminate),
  };
});
