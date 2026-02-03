import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
} from 'ng-primitives/state';

/**
 * The state for the NgpNavigationMenuLink directive.
 */
export interface NgpNavigationMenuLinkState {
  /**
   * Whether the link is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * Whether the link is active (current page).
   */
  readonly active: Signal<boolean>;

  /**
   * Set whether the link is disabled.
   * @param isDisabled Whether the link is disabled
   */
  setDisabled(isDisabled: boolean): void;

  /**
   * Set whether the link is active.
   * @param isActive Whether the link is active
   */
  setActive(isActive: boolean): void;
}

/**
 * The props for the NgpNavigationMenuLink state.
 */
export interface NgpNavigationMenuLinkProps {
  /**
   * Whether the link is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * Whether the link is active (current page).
   */
  readonly active?: Signal<boolean>;
}

export const [
  NgpNavigationMenuLinkStateToken,
  ngpNavigationMenuLink,
  injectNavigationMenuLinkState,
  provideNavigationMenuLinkState,
] = createPrimitive(
  'NgpNavigationMenuLink',
  ({
    disabled: _disabled = signal(false),
    active: _active = signal(false),
  }: NgpNavigationMenuLinkProps) => {
    const element = injectElementRef();

    // Controlled properties
    const disabled = controlled(_disabled);
    const active = controlled(_active);

    // Host bindings
    attrBinding(element, 'aria-current', () => (active() ? 'page' : null));
    attrBinding(element, 'aria-disabled', () => (disabled() ? 'true' : null));
    dataBinding(element, 'data-active', active);
    dataBinding(element, 'data-disabled', disabled);

    // Prevent click when disabled
    listener(element, 'click', (event: MouseEvent) => {
      if (disabled()) {
        event.preventDefault();
        event.stopPropagation();
      }
    });

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);
    }

    function setActive(isActive: boolean): void {
      active.set(isActive);
    }

    return {
      disabled: disabled.asReadonly(),
      active: active.asReadonly(),
      setDisabled,
      setActive,
    } satisfies NgpNavigationMenuLinkState;
  },
);
