import { signal, Signal } from '@angular/core';
import { setupFocusVisible } from './focus-visible';
import { setupHover } from './hover';
import { setupPress } from './press';

export interface NgpInteractionOptions {
  disabled?: Signal<boolean>;
}

/**
 * Setup the interactions without relying on HostDirectives.
 */
export function setupInteractions({ disabled = signal(false) }: NgpInteractionOptions): void {
  setupHover({ disabled });
  setupPress({ disabled });
  setupFocusVisible({ disabled });
}
