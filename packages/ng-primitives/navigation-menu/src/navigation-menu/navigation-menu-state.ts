import { computed, signal, Signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, createPrimitive, dataBinding } from 'ng-primitives/state';

export interface NgpNavigationMenuState {
  /**
   * The orientation of the navigation menu.
   */
  readonly orientation: Signal<NgpOrientation>;

  /**
   * The delay in milliseconds before showing content.
   */
  readonly showDelay: Signal<number>;

  /**
   * The delay in milliseconds before hiding content.
   */
  readonly hideDelay: Signal<number>;

  /**
   * The currently active item value (open menu item).
   */
  readonly activeItem: Signal<string | null>;

  /**
   * Set the active item by value.
   * @param value The item value to activate (or null to deactivate)
   */
  setActiveItem(value: string | null): void;

  /**
   * Set the orientation of the navigation menu.
   * @param orientation The orientation
   */
  setOrientation(orientation: NgpOrientation): void;

  /**
   * Set the show delay.
   * @param delay The delay in milliseconds
   */
  setShowDelay(delay: number): void;

  /**
   * Set the hide delay.
   * @param delay The delay in milliseconds
   */
  setHideDelay(delay: number): void;
}

export interface NgpNavigationMenuProps {
  /**
   * The orientation of the navigation menu.
   */
  readonly orientation?: Signal<NgpOrientation>;

  /**
   * The delay in milliseconds before showing content.
   */
  readonly showDelay?: Signal<number>;

  /**
   * The delay in milliseconds before hiding content.
   */
  readonly hideDelay?: Signal<number>;

  /**
   * The initially active item value.
   */
  readonly value?: Signal<string | null>;

  /**
   * Callback when the active item changes.
   */
  readonly onValueChange?: (value: string | null) => void;
}

export const [
  NgpNavigationMenuStateToken,
  ngpNavigationMenu,
  injectNavigationMenuState,
  provideNavigationMenuState,
] = createPrimitive(
  'NgpNavigationMenu',
  ({
    orientation: _orientation = signal('horizontal'),
    showDelay: _showDelay = signal(200),
    hideDelay: _hideDelay = signal(150),
    value: _value = signal(null),
    onValueChange,
  }: NgpNavigationMenuProps) => {
    const element = injectElementRef();

    // Controlled properties
    const orientation = controlled(_orientation);
    const showDelay = controlled(_showDelay);
    const hideDelay = controlled(_hideDelay);
    const activeItem = controlled(_value);

    // Host bindings
    dataBinding(element, 'data-orientation', orientation);

    // Methods
    function setActiveItem(value: string | null): void {
      if (activeItem() === value) {
        return;
      }
      activeItem.set(value);
      onValueChange?.(value);
    }

    function setOrientation(newOrientation: NgpOrientation): void {
      orientation.set(newOrientation);
    }

    function setShowDelay(delay: number): void {
      showDelay.set(delay);
    }

    function setHideDelay(delay: number): void {
      hideDelay.set(delay);
    }

    return {
      orientation: orientation.asReadonly(),
      showDelay: showDelay.asReadonly(),
      hideDelay: hideDelay.asReadonly(),
      activeItem: computed(() => activeItem()),
      setActiveItem,
      setOrientation,
      setShowDelay,
      setHideDelay,
    } satisfies NgpNavigationMenuState;
  },
);
