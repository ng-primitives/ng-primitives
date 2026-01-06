import { signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding } from 'ng-primitives/state';

export interface NgpAvatarState {
  /**
   * The avatar status.
   */
  status: Signal<NgpAvatarStatus>;

  /**
   * Set the avatar status.
   */
  setStatus(status: NgpAvatarStatus): void;
}

export interface NgpAvatarProps {}

export const [NgpAvatarStateToken, ngpAvatar, injectAvatarState, provideAvatarState] =
  createPrimitive('NgpAvatar', ({}: NgpAvatarProps) => {
    const element = injectElementRef();
    const status = signal(NgpAvatarStatus.Idle);

    // Host bindings
    dataBinding(element, 'data-status', status);

    function setStatus(newStatus: NgpAvatarStatus): void {
      status.set(newStatus);
    }

    return {
      status,
      setStatus,
    } satisfies NgpAvatarState;
  });

export enum NgpAvatarStatus {
  Idle = 'idle',
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
}
