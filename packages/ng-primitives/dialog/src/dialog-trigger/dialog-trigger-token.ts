import { InjectionToken, inject } from '@angular/core';
import type { NgpDialogTrigger } from './dialog-trigger';

export const NgpDialogTriggerToken = new InjectionToken<NgpDialogTrigger>('NgpDialogTriggerToken');

/**
 * Inject the DialogTrigger directive instance
 */
export function injectDialogTrigger(): NgpDialogTrigger {
  return inject(NgpDialogTriggerToken);
}
