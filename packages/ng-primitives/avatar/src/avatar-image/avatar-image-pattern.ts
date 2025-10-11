import { ElementRef, FactoryProvider, inject, InjectionToken, Type } from '@angular/core';
import { injectVisuallyHiddenState } from 'ng-primitives/a11y';
import { injectElementRef } from 'ng-primitives/internal';
import { listener } from 'ng-primitives/state';
import { NgpAvatarStatus } from '../avatar/avatar-pattern';
import { injectAvatarPattern } from '../avatar/avatar-pattern';

export interface NgpAvatarImageState {
  checkImageStatus(): void;
  setState(status: NgpAvatarStatus): void;
}

export interface NgpAvatarImageProps {
  element?: ElementRef<HTMLImageElement>;
}

export function ngpAvatarImagePattern({
  element = injectElementRef<HTMLImageElement>(),
}: NgpAvatarImageProps = {}): NgpAvatarImageState {
  const avatar = injectAvatarPattern();
  const visuallyHidden = injectVisuallyHiddenState();

  // Set up event listeners
  listener(element, 'load', () => setState(NgpAvatarStatus.Loaded));
  listener(element, 'error', () => setState(NgpAvatarStatus.Error));

  function checkImageStatus(): void {
    // mark the avatar as loading
    setState(NgpAvatarStatus.Loading);

    // if there is no src, we can report this as an error
    if (!element.nativeElement.src) {
      setState(NgpAvatarStatus.Error);
      return;
    }

    // if the image has already loaded, we can report this to the avatar
    if (element.nativeElement.complete) {
      setState(NgpAvatarStatus.Loaded);
    }
  }

  function setState(status: NgpAvatarStatus): void {
    avatar.setStatus(status);

    // if the state is loaded then we should make the image visible
    visuallyHidden().setVisibility(status === NgpAvatarStatus.Loaded);
  }

  return { checkImageStatus, setState };
}

export const NgpAvatarImagePatternToken = new InjectionToken<NgpAvatarImageState>(
  'NgpAvatarImagePatternToken',
);

export function injectAvatarImagePattern(): NgpAvatarImageState {
  return inject(NgpAvatarImagePatternToken);
}

export function provideAvatarImagePattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpAvatarImageState,
): FactoryProvider {
  return { provide: NgpAvatarImagePatternToken, useFactory: () => fn(inject(type)) };
}
