import { OutputEmitterRef, Signal } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { createState } from 'ng-primitives/state';
import type { NgpTabPanel } from '../tab-panel/tab-panel';

/**
 * The state for the tabset primitive.
 */
export interface NgpTabsetState {
  /**
   * The id of the tabset
   */
  id: Signal<string>;

  /**
   * The active tab
   */
  value: Signal<string | undefined>;

  /**
   * Emit the value of the selected tab when it changes
   */
  valueChange: OutputEmitterRef<string | undefined>;

  /**
   * The orientation of the tabset
   */
  orientation: Signal<NgpOrientation>;

  /**
   * Whether tabs should activate on focus
   */
  activateOnFocus: Signal<boolean>;

  /**
   * The id of the active tab
   */
  selectedTab: Signal<string | undefined>;

  /**
   * A function to register a tab panel
   */
  registerTab: (panel: NgpTabPanel) => void;

  /**
   * A function to unregister a tab panel
   */
  unregisterTab: (panel: NgpTabPanel) => void;

  /**
   * A function to select a tab
   */
  select: (value: string) => void;
}

/**
 * The initial state for the tabset primitive.
 */
export const { NgpTabsetStateToken, provideTabsetState, injectTabsetState, tabsetState } =
  createState<NgpTabsetState>('Tabset');
