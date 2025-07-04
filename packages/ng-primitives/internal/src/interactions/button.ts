import { Signal } from '@angular/core';
import { booleanAttributeBinding } from 'ng-primitives/utils';
import { injectElementRef } from '../utilities/element-ref';
import { hasInteraction } from '../utilities/interaction';
import { setupInteractions } from './interactions';

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
 */
export function setupButton({ disabled }: NgpButtonOptions): void {
  const elementRef = injectElementRef();

  // If the button interaction has already been setup, we can skip the setup.
  if (hasInteraction(elementRef.nativeElement, 'button')) {
    return;
  }

  const isButton = elementRef.nativeElement.tagName.toLowerCase() === 'button';

  setupInteractions({ hover: true, press: true, focusVisible: true, disabled });

  // add the the `data-disabled` attribute to the element
  booleanAttributeBinding(elementRef.nativeElement, 'data-disabled', disabled);

  // add the `disabled` attribute to the element if it is a button
  if (isButton) {
    booleanAttributeBinding(elementRef.nativeElement, 'disabled', disabled);
  }
}
