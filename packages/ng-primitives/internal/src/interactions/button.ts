import { signal, Signal } from '@angular/core';
import { setupFocusVisible } from './focus-visible';
import { setupHover } from './hover';
import { setupPress } from './press';

export interface NgpButtonOptions {
  disabled?: Signal<boolean>;
}

/**
 * Setup the button interactions without relying on HostDirectives.
 */
export function setupButton({ disabled = signal(false) }: NgpButtonOptions): void {
  setupHover({ disabled });
  setupPress({ disabled });
  setupFocusVisible({ disabled });
}
