import { computed, inject, InjectionToken, signal, Signal } from '@angular/core';

export const NgpDisabledToken = new InjectionToken<NgpCanDisable>('NgpDisabledToken');

export interface NgpCanDisable {
  /**
   * Whether the element is disabled.
   */
  readonly disabled: Signal<boolean>;
}

/**
 * Determine if we are in a disabled context.
 * @param disabled The disabled signal for the local context.
 * @returns The disabled signal.
 */
export function injectDisabled(
  disabled: Signal<boolean> = signal<boolean>(false),
): Signal<boolean> {
  const provider = inject(NgpDisabledToken, { optional: true, self: true });

  return computed(() => provider?.disabled() || disabled());
}
