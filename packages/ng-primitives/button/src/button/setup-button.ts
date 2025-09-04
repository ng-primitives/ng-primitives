import { Signal } from '@angular/core';
import { setupInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { booleanAttributeBinding } from 'ng-primitives/utils';

export interface NgpButtonOptions {
  /**
   * Whether the button is disabled.
   * @default false
   */
  disabled?: Signal<boolean>;
}

/**
 * Setup the button interactions and attributes.
 *
 * @param options - The options for the button.
 * @internal
 */
export function setupButton({ disabled }: NgpButtonOptions): void {
  const elementRef = injectElementRef();
  const isButton = elementRef.nativeElement.tagName.toLowerCase() === 'button';

  setupInteractions({ hover: true, press: true, focusVisible: true, disabled });

  // add the `data-disabled` attribute to the element
  booleanAttributeBinding(elementRef.nativeElement, 'data-disabled', disabled);

  // add the `disabled` attribute to the element if it is a button
  if (isButton) {
    booleanAttributeBinding(elementRef.nativeElement, 'disabled', disabled);
  }
}
