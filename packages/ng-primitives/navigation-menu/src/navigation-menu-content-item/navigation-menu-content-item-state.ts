import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, createPrimitive, dataBinding } from 'ng-primitives/state';

/**
 * The state for the NgpNavigationMenuContentItem directive.
 */
export interface NgpNavigationMenuContentItemState {
  /**
   * Whether the item is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * Set whether the item is disabled.
   * @param isDisabled Whether the item is disabled
   */
  setDisabled(isDisabled: boolean): void;
}

/**
 * The props for the NgpNavigationMenuContentItem state.
 */
export interface NgpNavigationMenuContentItemProps {
  /**
   * Whether the item is disabled.
   */
  readonly disabled?: Signal<boolean>;
}

export const [
  NgpNavigationMenuContentItemStateToken,
  ngpNavigationMenuContentItem,
  injectNavigationMenuContentItemState,
  provideNavigationMenuContentItemState,
] = createPrimitive(
  'NgpNavigationMenuContentItem',
  ({ disabled: _disabled = signal(false) }: NgpNavigationMenuContentItemProps) => {
    const element = injectElementRef();

    // Controlled properties
    const disabled = controlled(_disabled);

    // Host bindings
    attrBinding(element, 'role', 'menuitem');
    dataBinding(element, 'data-disabled', disabled);

    function setDisabled(isDisabled: boolean): void {
      disabled.set(isDisabled);
    }

    return {
      disabled: disabled.asReadonly(),
      setDisabled,
    } satisfies NgpNavigationMenuContentItemState;
  },
);
