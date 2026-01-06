import { signal, Signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, createPrimitive, deprecatedSetter } from 'ng-primitives/state';

/**
 * The state interface for the Accordion pattern.
 */
export interface NgpAccordionState<T> {
  /**
   * The value of the accordion.
   */
  readonly value: WritableSignal<T | T[] | null>;
  /**
   * Whether the accordion is disabled.
   */
  readonly disabled: WritableSignal<boolean>;
  /**
   * The accordion orientation.
   */
  readonly orientation: WritableSignal<NgpOrientation>;
  /**
   * Set the value of the accordion.
   */
  setValue(value: T | T[] | null): void;
  /**
   * Set the disabled state of the accordion.
   */
  setDisabled(value: boolean): void;
  /**
   * Set the orientation of the accordion.
   */
  setOrientation(value: NgpOrientation): void;
  /**
   * Whether the specified value is open.
   */
  isOpen(value: T): boolean;
  /**
   * Toggle the specified value.
   */
  toggle(value: T): void;
}

/**
 * The props interface for the Accordion pattern.
 */
export interface NgpAccordionProps<T> {
  /**
   * The type of the accordion.
   */
  readonly type: Signal<NgpAccordionType>;

  /**
   * Whether the accordion is collapsible.
   */
  readonly collapsible: Signal<boolean>;

  /**
   * The value of the accordion.
   */
  readonly value: Signal<T | T[] | null>;

  /**
   * Whether the accordion is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * The accordion orientation.
   */
  readonly orientation: Signal<NgpOrientation>;

  /**
   * Callback fired when valueChange is emitted.
   */
  readonly onValueChange?: (value: T | T[] | null) => void;
}

export const [NgpAccordionStateToken, ngpAccordion, _injectAccordionState, provideAccordionState] =
  createPrimitive(
    'NgpAccordion',
    <T>({
      type,
      collapsible,
      value: _value = signal(null),
      disabled: _disabled = signal(false),
      orientation: _orientation = signal('vertical'),
      onValueChange,
    }: NgpAccordionProps<T>): NgpAccordionState<T> => {
      const element = injectElementRef();

      // Create controlled signals
      const value = controlled(_value);
      const disabled = controlled(_disabled);
      const orientation = controlled(_orientation);

      // Host bindings extracted from directive
      attrBinding(element, 'data-orientation', orientation);
      attrBinding(element, 'data-disabled', disabled);

      // Setter methods
      function setDisabled(value: boolean): void {
        disabled.set(value);
      }

      function setOrientation(value: NgpOrientation): void {
        orientation.set(value);
      }

      function setValue(newValue: T | T[] | null): void {
        value.set(newValue);
      }

      // Methods extracted from directive
      /**
       * @param value The value to check. @returns Whether the value is open. @internal
       */
      function isOpen(itemValue: T): boolean {
        if (type() === 'multiple') {
          return (value() as T[] | null)?.includes(itemValue) ?? false;
        }

        return value() === itemValue;
      }

      function toggle(itemValue: T): void {
        const open = isOpen(itemValue);

        // if we are in single mode and the itemValue is already open and the accordion is not collapsible, do nothing
        if (type() === 'single' && open && !collapsible()) {
          return;
        }

        // if we are in single mode then toggle the itemValue
        if (type() === 'single') {
          const newValue = open ? null : itemValue;
          value.set(newValue);
          onValueChange?.(newValue);
          return;
        }

        // if we are in multiple mode then toggle the itemValue
        let values = (value() as T[]) ?? [];

        if (open) {
          values = values.filter(v => v !== itemValue);
        } else {
          values = [...values, itemValue];
        }
        value.set(values);
        onValueChange?.(values);
      }

      return {
        value: deprecatedSetter(value, 'setValue'),
        disabled: deprecatedSetter(disabled, 'setDisabled'),
        orientation: deprecatedSetter(orientation, 'setOrientation'),
        setDisabled,
        setOrientation,
        setValue,
        isOpen,
        toggle,
      } satisfies NgpAccordionState<T>;
    },
  );

export type NgpAccordionType = 'single' | 'multiple';

export function injectAccordionState<T>(): Signal<NgpAccordionState<T>> {
  return _injectAccordionState() as Signal<NgpAccordionState<T>>;
}
