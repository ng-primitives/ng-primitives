/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, Provider, inject } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';

export interface NgpToggleGroupConfig {
  /**
   * The orientation of the toggle group.
   * @default 'horizontal'
   */
  orientation: NgpOrientation;

  /**
   * The type of the toggle group, whether only one item can be selected or multiple.
   * @default 'single'
   */
  type: 'single' | 'multiple';
}

export const defaultToggleGroupConfig: NgpToggleGroupConfig = {
  orientation: 'horizontal',
  type: 'single',
};

export const NgpToggleGroupConfigToken = new InjectionToken<NgpToggleGroupConfig>(
  'NgpToggleGroupConfigToken',
);

/**
 * Provide the default ToggleGroup configuration
 * @param config The ToggleGroup configuration
 * @returns The provider
 */
export function provideToggleGroupConfig(config: Partial<NgpToggleGroupConfig>): Provider[] {
  return [
    {
      provide: NgpToggleGroupConfigToken,
      useValue: { ...defaultToggleGroupConfig, ...config },
    },
  ];
}

/**
 * Inject the ToggleGroup configuration
 * @returns The global ToggleGroup configuration
 */
export function injectToggleGroupConfig(): NgpToggleGroupConfig {
  return inject(NgpToggleGroupConfigToken, { optional: true }) ?? defaultToggleGroupConfig;
}
