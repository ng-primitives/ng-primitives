import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Signal,
  signal,
  Type,
} from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import {
  ngpRovingFocusGroupPattern,
  NgpRovingFocusGroupState,
  provideRovingFocusGroupPattern,
} from 'ng-primitives/roving-focus';
import { attrBinding, controlled, dataBinding } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { NgpTabButtonState } from '../tab-button/tab-button-pattern';

/**
 * The state interface for the Tabset pattern.
 */
export interface NgpTabsetState {
  /**
   * The id of the tabset
   */
  readonly id: Signal<string>;

  /**
   * The active tab value
   */
  readonly value: Signal<string | undefined>;

  /**
   * The orientation of the tabset
   */
  readonly orientation: Signal<NgpOrientation>;

  /**
   * Whether tabs should activate on focus
   */
  readonly activateOnFocus: Signal<boolean>;

  /**
   * The id of the selected tab
   */
  readonly selectedTab: Signal<string | undefined>;

  /**
   * Access the tabs within the tabset
   */
  readonly buttons: Signal<NgpTabButtonState[]>;

  /**
   * The roving focus state for the tabset
   * @internal
   */
  readonly rovingFocus: NgpRovingFocusGroupState;

  /**
   * Select a tab by its value
   */
  select: (value: string) => void;

  /**
   * Register a tab with the tabset
   */
  registerTab: (tab: NgpTabButtonState) => void;

  /**
   * Unregister a tab with the tabset
   */
  unregisterTab: (tab: NgpTabButtonState) => void;
}

/**
 * The props interface for the Tabset pattern.
 */
export interface NgpTabsetProps {
  /**
   * The element reference for the tabset.
   */
  element?: ElementRef<HTMLElement>;

  /**
   * The id of the tabset
   */
  id?: Signal<string>;

  /**
   * The active tab value
   */
  value?: Signal<string | undefined>;

  /**
   * The orientation of the tabset
   */
  orientation?: Signal<NgpOrientation>;

  /**
   * Whether tabs should activate on focus
   */
  activateOnFocus?: Signal<boolean>;

  /**
   * Emit the value of the selected tab when it changes
   */
  onValueChange?: (value: string | undefined) => void;
}

/**
 * The Tabset pattern function.
 */
export function ngpTabsetPattern({
  element = injectElementRef(),
  id = signal(uniqueId('ngp-tabset')),
  value: _value = signal<string | undefined>(undefined),
  orientation = signal<NgpOrientation>('horizontal'),
  activateOnFocus = signal<boolean>(true),
  onValueChange,
}: NgpTabsetProps = {}): NgpTabsetState {
  const value = controlled(_value);
  const buttons = signal<NgpTabButtonState[]>([]);

  const selectedTab = computed(() => {
    const buttonsValue = buttons();
    const currentValue = value?.();

    // if there are no tabs then return the selected value
    // if there is a value set and a tab with that value exists, return the value
    if (buttonsValue.length === 0 || buttonsValue.some(button => button.value() === currentValue)) {
      return currentValue;
    }

    // otherwise return the first non-disabled tab's value
    return buttonsValue.find(button => !button.disabled())?.value();
  });

  // Setup host bindings
  attrBinding(element, 'id', id);
  dataBinding(element, 'data-orientation', orientation);

  // setup roving focus
  const rovingFocus = ngpRovingFocusGroupPattern({
    element,
    homeEnd: signal(true),
    orientation,
    wrap: signal(true),
  });

  const select = (tabValue: string): void => {
    // if the value is already selected, do nothing
    if (value() === tabValue) {
      return;
    }

    value.set(tabValue);
    onValueChange?.(tabValue);
  };

  const registerTab = (tab: NgpTabButtonState): void => {
    buttons.update(buttonsValue => [...buttonsValue, tab]);
  };

  const unregisterTab = (tab: NgpTabButtonState): void => {
    buttons.update(buttonsValue => buttonsValue.filter(button => button !== tab));
  };

  return {
    id,
    value,
    orientation,
    activateOnFocus,
    selectedTab,
    buttons: buttons.asReadonly(),
    select,
    registerTab,
    unregisterTab,
    rovingFocus,
  };
}

/**
 * The injection token for the Tabset pattern.
 */
export const NgpTabsetPatternToken = new InjectionToken<NgpTabsetState>('NgpTabsetPatternToken');

/**
 * Injects the Tabset pattern.
 */
export function injectTabsetPattern(): NgpTabsetState {
  return inject(NgpTabsetPatternToken);
}

/**
 * Provides the Tabset pattern.
 */
export function provideTabsetPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpTabsetState,
): FactoryProvider[] {
  return [
    { provide: NgpTabsetPatternToken, useFactory: () => fn(inject(type)) },
    provideRovingFocusGroupPattern(type, instance => fn(instance).rovingFocus),
  ];
}
