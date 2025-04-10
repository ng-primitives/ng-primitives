import { InjectionToken, inject } from '@angular/core';
import type { NgpTooltip } from './tooltip';

export const NgpTooltipToken = new InjectionToken<NgpTooltip>('NgpTooltipToken');

/**
 * Inject the Tooltip directive instance
 */
export function injectTooltip(): NgpTooltip {
  return inject(NgpTooltipToken);
}
