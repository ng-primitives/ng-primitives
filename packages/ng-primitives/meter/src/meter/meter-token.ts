import { InjectionToken, inject, Type, ExistingProvider } from '@angular/core';
import type { NgpMeter } from './meter';

export const NgpMeterToken = new InjectionToken<NgpMeter>('NgpMeterToken');

/**
 * Inject the Meter directive instance
 */
export function injectMeter(): NgpMeter {
  return inject(NgpMeterToken);
}

/**
 * Provide the Meter directive instance
 */
export function provideMeter(type: Type<NgpMeter>): ExistingProvider {
  return { provide: NgpMeterToken, useExisting: type };
}
