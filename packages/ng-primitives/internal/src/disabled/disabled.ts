import { inject, InjectionToken, signal, Signal } from '@angular/core';

export const NgpDisabledToken = new InjectionToken<NgpCanDisable>('NgpDisabledToken');

export interface NgpCanDisable {
  /**
   * Whether the element is disabled.
   */
  readonly disabled: Signal<boolean>;
}

/**
 * Determine if we are in a disabled context.
 * @returns The disabled signal.
 */
export function injectDisabled(): Signal<boolean> {
  const disabled = signal<boolean>(false);
  const provider = inject(NgpDisabledToken, { optional: true });

  return provider ? provider.disabled : disabled;
}
