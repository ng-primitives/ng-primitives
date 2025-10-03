import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  OutputEmitterRef,
  Signal,
  Type,
} from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, dataBinding } from 'ng-primitives/state';

export interface NgpAccordionState<T> {
  disabled: Signal<boolean>;
  orientation: Signal<NgpOrientation>;
  isOpen(value: T): boolean;
  toggle(value: T): void;
}

export interface NgpAccordionProps<T> {
  type: Signal<NgpAccordionType>;
  collapsible: Signal<boolean>;
  value: Signal<T | T[] | null>;
  disabled: Signal<boolean>;
  orientation: Signal<NgpOrientation>;
  valueChange: OutputEmitterRef<T | T[] | null>;
  element?: ElementRef<HTMLElement>;
}

export function ngpAccordionPattern<T>({
  type,
  collapsible,
  value: _value,
  disabled,
  orientation,
  valueChange,
  element = injectElementRef(),
}: NgpAccordionProps<T>): NgpAccordionState<T> {
  const value = controlled(_value, valueChange);

  // setup data bindings
  dataBinding(element, 'data-orientation', orientation);
  dataBinding(element, 'data-disabled', disabled);

  function isOpen(itemValue: T): boolean {
    if (type() === 'multiple') {
      return (value() as T[] | null)?.includes(itemValue) ?? false;
    }

    return value() === itemValue;
  }

  function toggle(itemValue: T): void {
    const open = isOpen(itemValue);

    // if we are in single mode and the value is already open and the accordion is not collapsible, do nothing
    if (type() === 'single' && open && !collapsible()) {
      return;
    }

    // if we are in single mode then toggle the value
    if (type() === 'single') {
      const newValue = open ? null : itemValue;
      value.set(newValue);
      valueChange.emit(newValue);
      return;
    }

    // if we are in multiple mode then toggle the value
    let values = (value() as T[]) ?? [];

    if (open) {
      values = values.filter(v => v !== itemValue);
    } else {
      values = [...values, itemValue];
    }
    value.set(values);
    valueChange.emit(values);
  }

  return { disabled, orientation, isOpen, toggle };
}

export type NgpAccordionType = 'single' | 'multiple';

export const NgpAccordionPatternToken = new InjectionToken<NgpAccordionState<unknown>>(
  'NgpAccordionPatternToken',
);

export function injectAccordionPattern<T>(): NgpAccordionState<T> {
  return inject(NgpAccordionPatternToken) as NgpAccordionState<T>;
}

export function provideAccordionPattern<T, V>(
  type: Type<T>,
  fn: (instance: T) => NgpAccordionState<V>,
): FactoryProvider {
  return { provide: NgpAccordionPatternToken, useFactory: () => fn(inject(type)) };
}
