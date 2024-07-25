/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpAvatar } from './avatar.directive';

export const NgpAvatarToken = new InjectionToken<NgpAvatar>('NgpAvatarToken');

/**
 * Provide the avatar
 * @returns The provider
 */
export function injectAvatar(): NgpAvatar {
  return inject(NgpAvatarToken);
}
