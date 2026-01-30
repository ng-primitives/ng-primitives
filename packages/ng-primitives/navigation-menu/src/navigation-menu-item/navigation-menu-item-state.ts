import { computed, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, createPrimitive, dataBinding } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';

/**
 * The state for the NgpNavigationMenuItem directive.
 */
export interface NgpNavigationMenuItemState {
  /**
   * The unique value identifying this menu item.
   */
  readonly value: Signal<string>;

  /**
   * Whether this menu item is currently active (open).
   */
  readonly active: Signal<boolean>;

  /**
   * Show the content for this menu item.
   */
  show(): void;

  /**
   * Hide the content for this menu item.
   */
  hide(): void;

  /**
   * Set the value for this menu item.
   * @param value The new value
   */
  setValue(value: string): void;
}

/**
 * The props for the NgpNavigationMenuItem state.
 */
export interface NgpNavigationMenuItemProps {
  /**
   * The unique value identifying this menu item.
   */
  readonly value?: Signal<string>;
}

export const [
  NgpNavigationMenuItemStateToken,
  ngpNavigationMenuItem,
  injectNavigationMenuItemState,
  provideNavigationMenuItemState,
] = createPrimitive(
  'NgpNavigationMenuItem',
  ({ value: _value = signal(uniqueId('navigation-menu-item')) }: NgpNavigationMenuItemProps) => {
    const element = injectElementRef();
    const navigationMenuState = injectNavigationMenuState();

    // Controlled properties
    const value = controlled(_value);

    // Computed state
    const active = computed(() => navigationMenuState().activeItem() === value());

    // Host bindings
    dataBinding(element, 'data-active', active);

    // Methods
    function show(): void {
      navigationMenuState().setActiveItem(value());
    }

    function hide(): void {
      if (active()) {
        navigationMenuState().setActiveItem(null);
      }
    }

    function setValue(newValue: string): void {
      value.set(newValue);
    }

    return {
      value: value.asReadonly(),
      active,
      show,
      hide,
      setValue,
    } satisfies NgpNavigationMenuItemState;
  },
);
