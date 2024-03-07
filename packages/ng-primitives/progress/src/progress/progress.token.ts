import { InjectionToken, inject } from '@angular/core';
import type { NgpProgressDirective } from './progress.directive';

export const NgpProgressToken = new InjectionToken<NgpProgressDirective>('NgpProgressDirective');

export function injectProgress(): NgpProgressDirective {
  return inject(NgpProgressToken);
}
