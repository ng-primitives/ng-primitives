import { signal, Signal } from '@angular/core';
import { setupFocus } from './focus';
import { setupFocusVisible } from './focus-visible';
import { setupHover } from './hover';
import { setupPress } from './press';

export interface NgpInteractionOptions {
  hover?: boolean;
  press?: boolean;
  focus?: boolean;
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
  focusVisible,
  disabled = signal(false),
}: NgpInteractionOptions): void {
  if (hover) {
    setupHover({ disabled });
  }
  if (press) {
    setupPress({ disabled });
  }
  if (focus) {
    setupFocus({ disabled });
  }
  if (focusVisible) {
    setupFocusVisible({ disabled });
  }
}
