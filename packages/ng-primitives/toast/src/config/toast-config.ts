/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, Provider, inject } from '@angular/core';
import { NgpToastGravity, NgpToastPosition } from '../toast/toast-ref';

export interface NgpToastConfig {
  /**
   * The duration of each toast.
   */
  duration: number;

  /**
   * The gravity of each toast.
   */
  gravity: NgpToastGravity;

  /**
   * The position of each toast.
   */
  position: NgpToastPosition;

  /**
   * Whether we should stop on hover.
   */
  stopOnHover: boolean;

  /**
   * The aria live setting.
   */
  ariaLive: string;

  /**
   * The gap between each toast.
   */
  gap: number;
}

export const defaultToastConfig: NgpToastConfig = {
  gap: 16,
  duration: 3000,
  gravity: 'top',
  position: 'end',
  stopOnHover: true,
  ariaLive: 'polite',
};

export const NgpToastConfigToken = new InjectionToken<NgpToastConfig>('NgpToastConfigToken');

/**
 * Provide the default Toast configuration
 * @param config The Toast configuration
 * @returns The provider
 */
export function provideToastConfig(config: Partial<NgpToastConfig>): Provider[] {
  return [
    {
      provide: NgpToastConfigToken,
      useValue: { ...defaultToastConfig, ...config },
    },
  ];
}

/**
 * Inject the Toast configuration
 * @returns The global Toast configuration
 */
export function injectToastConfig(): NgpToastConfig {
  return inject(NgpToastConfigToken, { optional: true }) ?? defaultToastConfig;
}
