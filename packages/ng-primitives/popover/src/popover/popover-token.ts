import { InjectionToken, inject } from '@angular/core';
import type { NgpPopover } from './popover';

export const NgpPopoverToken = new InjectionToken<NgpPopover>('NgpPopoverToken');

/**
 * Inject the Popover directive instance
 */
export function injectPopover(): NgpPopover {
  return inject(NgpPopoverToken);
}
