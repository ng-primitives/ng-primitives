import { InjectionToken, inject } from '@angular/core';
import type { NgpTabPanel } from './tab-panel';

export const NgpTabPanelToken = new InjectionToken<NgpTabPanel>('NgpTabPanelToken');

/**
 * Inject the TabPanel directive instance
 * @returns The TabPanel directive instance
 */
export function injectTabPanel(): NgpTabPanel {
  return inject(NgpTabPanelToken);
}
