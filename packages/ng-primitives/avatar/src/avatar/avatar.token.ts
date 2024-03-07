import { InjectionToken, inject } from '@angular/core';
import type { NgpAvatarDirective } from './avatar.directive';

export const NgpAvatarToken = new InjectionToken<NgpAvatarDirective>('NgpAvatarToken');

export function injectAvatar(): NgpAvatarDirective {
  return inject(NgpAvatarToken);
}
