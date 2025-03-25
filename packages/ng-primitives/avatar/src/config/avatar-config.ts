/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, Provider, inject } from '@angular/core';

export interface NgpAvatarConfig {
  /**
   * Define a delay before the fallback is shown. This is useful to only show the fallback for those with slower connections.
   * @default 0
   */
  delay: number;
}

export const defaultAvatarConfig: NgpAvatarConfig = {
  delay: 0,
};

export const NgpAvatarConfigToken = new InjectionToken<NgpAvatarConfig>('NgpAvatarConfigToken');

/**
 * Provide the avatar config
 * @param config The avatar config
 * @returns The provider
 */
export function provideAvatarConfig(config: Partial<NgpAvatarConfig>): Provider[] {
  return [
    {
      provide: NgpAvatarConfigToken,
      useValue: { ...defaultAvatarConfig, ...config },
    },
  ];
}

/**
 * Inject the avatar config
 * @returns The global avatar config
 */
export function injectAvatarConfig(): NgpAvatarConfig {
  return inject(NgpAvatarConfigToken, { optional: true }) ?? defaultAvatarConfig;
}
