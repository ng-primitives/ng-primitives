import { computed, signal, Signal, WritableSignal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
} from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';

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
   * Set orientation of the tabset.
   */
  setOrientation(orientation: NgpOrientation): void;

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
      id = signal(uniqueId('ngp-tabset')),
      value: _value = signal(undefined),
      orientation: _orientation = signal('horizontal'),
      activateOnFocus = signal(false),
      onValueChange,
    }: NgpTabsetProps) => {
      const element = injectElementRef();
      const tabs = signal<NgpTab[]>([]);
      const value = controlled(_value);
      const orientation = controlled(_orientation);

      // Host bindings
      attrBinding(element, 'id', id);
      dataBinding(element, 'data-orientation', orientation);

      // Computed selected tab
      const selectedTab = computed(() => {
        const tabList = tabs();
        const currentValue = value();

        // if there are no tabs then return the selected value
        if (tabList.length === 0) {
          return currentValue;
        }

        // if there is a value set and a tab with that value exists, return the value
        if (currentValue && tabList.some(tab => tab.value() === currentValue)) {
          return currentValue;
        }

        // otherwise return the first non-disabled tab's value
        return tabList.find(tab => !tab.disabled())?.value();
      });

      function select(newValue: string): void {
        // if the value is already selected, do nothing
        if (value() === newValue) {
          return;
        }

        value.set(newValue);
        onValueChange?.(newValue);
      }

      function setOrientation(newOrientation: NgpOrientation): void {
        orientation.set(newOrientation);
      }

      function registerTab(tab: NgpTab): void {
        tabs.update(currentTabs => [...currentTabs, tab]);
      }

      function unregisterTab(tabValue: string): void {
        tabs.update(currentTabs => currentTabs.filter(tab => tab.value() !== tabValue));
      }

      return {
        id,
        orientation,
        activateOnFocus,
        value: deprecatedSetter(value, 'select'),
        selectedTab,
        select,
        setOrientation,
        registerTab,
        unregisterTab,
      };
    },
  );

export interface NgpTab {
  /**
   * The unique value for the tab.
   */
  readonly value: Signal<string>;

  /**
   * Whether the tab is disabled.
   */
  readonly disabled: Signal<boolean>;
}
