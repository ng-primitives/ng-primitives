import { Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { booleanAttributeBinding } from 'ng-primitives/utils';

/** @internal */
export interface NgpButtonOptions {
  /**
   * Whether the button is disabled.
   * @default false
   */
  disabled?: Signal<boolean>;
}

/**
 * @internal
 * Setup the button interactions and attributes.
 * @param options - The options for the button.
 */
export function setupButton({ disabled }: NgpButtonOptions): void {
  const elementRef = injectElementRef();
  const isButton = elementRef.nativeElement.tagName.toLowerCase() === 'button';

  ngpInteractions({ hover: true, press: true, focusVisible: true, disabled });

  // add the `data-disabled` attribute to the element
  booleanAttributeBinding(elementRef.nativeElement, 'data-disabled', disabled);

  // add the `disabled` attribute to the element if it is a button
  if (isButton) {
    booleanAttributeBinding(elementRef.nativeElement, 'disabled', disabled);
  }
}
