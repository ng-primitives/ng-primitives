/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, Provider, inject } from '@angular/core';

export interface NgpTabsConfig {
  /**
   * The orientation of the tabset
   * @default 'horizontal'
   */
  orientation: 'horizontal' | 'vertical';

  /**
   * Whether tabs should activate on focus
   * @default true
   */
  activateOnFocus: boolean;

  /**
   * Whether focus should wrap within the tab list when using the keyboard.
   * @default true
   */
  wrap: boolean;
}

export const defaultTabsConfig: NgpTabsConfig = {
  orientation: 'horizontal',
  activateOnFocus: true,
  wrap: true,
};

export const NgpTabsConfigToken = new InjectionToken<NgpTabsConfig>('NgpTabsConfigToken');

/**
 * Provide the default Tabs configuration
 * @param config The Tabs configuration
 * @returns The provider
 */
export function provideTabsConfig(config: Partial<NgpTabsConfig>): Provider[] {
  return [
    {
      provide: NgpTabsConfigToken,
      useValue: { ...defaultTabsConfig, ...config },
    },
  ];
}

/**
 * Inject the Tabs configuration
 * @returns The global Tabs configuration
 */
export function injectTabsConfig(): NgpTabsConfig {
  return inject(NgpTabsConfigToken, { optional: true }) ?? defaultTabsConfig;
}
