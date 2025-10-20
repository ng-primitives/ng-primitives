import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Signal,
  Type,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding } from 'ng-primitives/state';
import { injectTabsetPattern } from '../tabset/tabset-pattern';

/**
 * The state interface for the TabPanel pattern.
 */
export interface NgpTabPanelState {
  // Define state properties and methods
}

/**
 * The props interface for the TabPanel pattern.
 */
export interface NgpTabPanelProps {
  /**
   * The element reference for the tab-panel.
   */
  element?: ElementRef<HTMLElement>;

  /**
   * The id of the tab panel.
   */
  id?: Signal<string | undefined>;

  /**
   * The value of the tab panel.
   */
  value: Signal<string | undefined>;
}

/**
 * The TabPanel pattern function.
 */
export function ngpTabPanelPattern({
  id,
  value,
  element = injectElementRef(),
}: NgpTabPanelProps): NgpTabPanelState {
  const tabset = injectTabsetPattern();

  const panelId = computed(() => id?.() ?? `${tabset.id()}-panel-${value()}`);
  const labelledBy = computed(() => `${tabset.id()}-button-${value()}`);
  const active = computed(() => tabset.selectedTab() === value());

  attrBinding(element, 'role', 'tabpanel');
  attrBinding(element, 'tabIndex', '0');
  attrBinding(element, 'id', panelId);
  attrBinding(element, 'aria-labelledby', labelledBy);
  dataBinding(element, 'data-active', active);
  dataBinding(element, 'data-orientation', tabset.orientation);

  return {
    // Return state object
  };
}

/**
 * The injection token for the TabPanel pattern.
 */
export const NgpTabPanelPatternToken = new InjectionToken<NgpTabPanelState>(
  'NgpTabPanelPatternToken',
);

/**
 * Injects the TabPanel pattern.
 */
export function injectTabPanelPattern(): NgpTabPanelState {
  return inject(NgpTabPanelPatternToken);
}

/**
 * Provides the TabPanel pattern.
 */
export function provideTabPanelPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpTabPanelState,
): FactoryProvider {
  return { provide: NgpTabPanelPatternToken, useFactory: () => fn(inject(type)) };
}
