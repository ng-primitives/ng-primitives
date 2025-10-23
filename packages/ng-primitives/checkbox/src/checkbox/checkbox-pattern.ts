import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { ngpFormControlPattern } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, dataBinding, onClick, onPress } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';

/**
 * The state interface for the Checkbox pattern.
 */
export interface NgpCheckboxState {
  /**
   * Toggle method.
   */
  toggle: () => void;
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
  disabled = signal(false),
  onCheckedChange,
  onIndeterminateChange,
}: NgpCheckboxProps = {}): NgpCheckboxState {
  const checked = controlled(_checked);
  const indeterminate = controlled(_indeterminate);

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

  return {
    toggle,
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
