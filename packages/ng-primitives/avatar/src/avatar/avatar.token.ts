/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { InjectionToken, inject } from '@angular/core';
import type { NgpAvatarDirective } from './avatar.directive';

export const NgpAvatarToken = new InjectionToken<NgpAvatarDirective>('NgpAvatarToken');

/**
 * Provide the avatar
 * @returns The provider
 */
export function injectAvatar(): NgpAvatarDirective {
  return inject(NgpAvatarToken);
}
