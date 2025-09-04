import { signal, Signal } from '@angular/core';
import {
  injectElementRef,
  setupFocus,
  setupFocusVisible,
  setupHover,
  setupPress,
} from 'ng-primitives/internal';
import { hasInteraction } from './interaction';

export interface NgpInteractionOptions {
  hover?: boolean;
  press?: boolean;
  focus?: boolean;
  focusWithin?: boolean;
  focusVisible?: boolean;
  disabled?: Signal<boolean>;
}

/**
 * Setup the interactions without relying on HostDirectives.
 */
export function setupInteractions({
  focus,
  hover,
  press,
  focusWithin,
  focusVisible,
  disabled = signal(false),
}: NgpInteractionOptions): void {
  const elementRef = injectElementRef();
  // If the interaction has already been setup, we can skip the setup.
  if (hasInteraction(elementRef.nativeElement, 'interactions')) {
    return;
  }

  if (hover) {
    setupHover({ disabled });
  }
  if (press) {
    setupPress({ disabled });
  }
  if (focus) {
    setupFocus({ focusWithin, disabled });
  }
  if (focusVisible) {
    setupFocusVisible({ disabled });
  }
}
