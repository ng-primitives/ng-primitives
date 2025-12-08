import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import type { NgpRovingFocusGroupState } from 'ng-primitives/roving-focus';
import { attrBinding, controlled, createPrimitive, deprecatedSetter } from 'ng-primitives/state';

/**
 * The state for the NgpTabset directive.
 */
export interface NgpTabsetState {
  /**
   * The unique id for the tabset.
   */
  readonly id: Signal<string>;

  /**
   * The orientation of the tabset.
   */
  readonly orientation: Signal<NgpOrientation>;

  /**
   * Whether tabs should activate on focus.
   */
  readonly activateOnFocus: Signal<boolean>;

  /**
   * The selected tab value.
   */
  readonly value: WritableSignal<string | undefined>;

  /**
   * The selected tab computed value.
   */
  readonly selectedTab: Signal<string | undefined>;

  /**
   * Select a tab by its value.
   */
  select(value: string): void;

  /**
   * @internal Register a tab with the tabset.
   */
  registerTab(value: string, disabled: () => boolean): void;

  /**
   * @internal Unregister a tab with the tabset.
   */
  unregisterTab(value: string): void;
}

/**
 * The props for the NgpTabset state.
 */
export interface NgpTabsetProps {
  /**
   * The roving focus group state.
   */
  readonly rovingFocusGroup: NgpRovingFocusGroupState;

  /**
   * The unique id for the tabset.
   */
  readonly id?: Signal<string>;

  /**
   * The selected tab value.
   */
  readonly value?: Signal<string | undefined>;

  /**
   * The orientation of the tabset.
   */
  readonly orientation?: Signal<NgpOrientation>;

  /**
   * Whether tabs should activate on focus.
   */
  readonly activateOnFocus?: Signal<boolean>;

  /**
   * Callback when the selected tab changes.
   */
  readonly onValueChange?: (value: string | undefined) => void;
}

export const [NgpTabsetStateToken, ngpTabset, injectTabsetState, provideTabsetState] =
  createPrimitive(
    'NgpTabset',
    ({
      rovingFocusGroup: _rovingFocusGroup,
      id = signal(''),
      value: _value = signal(undefined),
      orientation = signal('horizontal'),
      activateOnFocus = signal(false),
      onValueChange,
    }: NgpTabsetProps) => {
      const element = injectElementRef();
      const tabs = signal<Array<{ value: string; disabled: () => boolean }>>([]);
      const value = controlled(_value);

      // Host bindings
      attrBinding(element, 'id', id);

      // Computed selected tab
      const selectedTab = computed(() => {
        const tabList = tabs();
        const currentValue = value();

        // if there are no tabs then return the selected value
        if (tabList.length === 0) {
          return currentValue;
        }

        // if there is a value set and a tab with that value exists, return the value
        if (currentValue && tabList.some(tab => tab.value === currentValue)) {
          return currentValue;
        }

        // otherwise return the first non-disabled tab's value
        return tabList.find(tab => !tab.disabled())?.value;
      });

      function select(newValue: string): void {
        // if the value is already selected, do nothing
        if (value() === newValue) {
          return;
        }

        value.set(newValue);
        onValueChange?.(newValue);
      }

      function registerTab(tabValue: string, disabled: () => boolean): void {
        tabs.update(currentTabs => [...currentTabs, { value: tabValue, disabled }]);
      }

      function unregisterTab(tabValue: string): void {
        tabs.update(currentTabs => currentTabs.filter(tab => tab.value !== tabValue));
      }

      return {
        id,
        orientation,
        activateOnFocus,
        value: deprecatedSetter(value, 'select'),
        selectedTab,
        select,
        registerTab,
        unregisterTab,
      };
    },
  );
