import { InjectionToken, inject } from '@angular/core';
import type { NgpTabPanelDirective } from './tab-panel.directive';

export const NgpTabPanelToken = new InjectionToken<NgpTabPanelDirective>('NgpTabPanelToken');

/**
 * Inject the TabPanel directive instance
 */
export function injectTabPanel(): NgpTabPanelDirective {
  return inject(NgpTabPanelToken);
}
