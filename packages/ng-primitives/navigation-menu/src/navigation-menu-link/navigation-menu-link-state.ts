import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  Emitter,
  emitter,
  listener,
} from 'ng-primitives/state';
import { injectNavigationMenuItemState } from '../navigation-menu-item/navigation-menu-item-state';
import { injectNavigationMenuState } from '../navigation-menu/navigation-menu-state';

/**
 * The state for the NgpNavigationMenuLink directive.
 */
export interface NgpNavigationMenuLinkState {
  /**
   * Whether the link is active.
   */
  readonly active: Signal<boolean>;

  /**
   * Emitter for select events.
   */
  readonly select: Emitter<Event>;

  /**
   * Set the active state.
   */
  setActive(active: boolean): void;
}

export interface NgpNavigationMenuLinkProps {
  /**
   * Whether the link is active.
   */
  readonly active?: Signal<boolean>;

  /**
   * Callback when the link is selected.
   */
  readonly onSelect?: (event: Event) => void;
}

export const [
  NgpNavigationMenuLinkStateToken,
  ngpNavigationMenuLink,
  injectNavigationMenuLinkState,
  provideNavigationMenuLinkState,
] = createPrimitive(
  'NgpNavigationMenuLink',
  ({
    active: _active = signal(false),
    onSelect,
  }: NgpNavigationMenuLinkProps): NgpNavigationMenuLinkState => {
    const element = injectElementRef();
    const menu = injectNavigationMenuState();
    const item = injectNavigationMenuItemState();

    const active = controlled(_active);
    const selectEmitter = emitter<Event>();

    // Host bindings
    attrBinding(element, 'role', 'menuitem');
    dataBinding(element, 'data-active', active);
    attrBinding(element, 'aria-current', () => (active() ? 'page' : null));

    // Event handlers
    listener(element, 'click', onClick);
    listener(element, 'keydown', onKeydown);

    function onClick(event: Event): void {
      handleSelect(event);
    }

    function onKeydown(event: KeyboardEvent): void {
      if (event.key === 'Enter' || event.key === ' ') {
        handleSelect(event);
      } else if (event.key === 'Escape') {
        event.preventDefault();
        // Close the menu and return focus to trigger
        menu().close();
        item().focusTrigger();
      }
    }

    function handleSelect(event: Event): void {
      selectEmitter.emit(event);
      onSelect?.(event);

      // Close the menu when a link is selected
      menu().close();
    }

    function setActive(value: boolean): void {
      active.set(value);
    }

    return {
      active,
      select: selectEmitter,
      setActive,
    } satisfies NgpNavigationMenuLinkState;
  },
);
