import { ngpVisuallyHidden } from 'ng-primitives/a11y';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, listener } from 'ng-primitives/state';
import { injectAvatarState, NgpAvatarStatus } from '../avatar/avatar-state';

export interface NgpAvatarImageState {}

export interface NgpAvatarImageProps {}

export const [
  NgpAvatarImageStateToken,
  ngpAvatarImage,
  injectAvatarImageState,
  provideAvatarImageState,
] = createPrimitive('NgpAvatarImage', ({}: NgpAvatarImageProps) => {
  const avatar = injectAvatarState();
  const element = injectElementRef<HTMLImageElement>();
  const visuallyHidden = ngpVisuallyHidden({});

  // initially mark the avatar as loading
  setStatus(NgpAvatarStatus.Loading);

  // if there is no src, we can report this as an error
  if (!element.nativeElement.src) {
    setStatus(NgpAvatarStatus.Error);
  }

  // if the image has already loaded, we can report this to the avatar
  if (element.nativeElement.complete) {
    setStatus(NgpAvatarStatus.Loaded);
  }

  // host listeners
  listener(element, 'load', () => setStatus(NgpAvatarStatus.Loaded));
  listener(element, 'error', () => setStatus(NgpAvatarStatus.Error));

  function setStatus(state: NgpAvatarStatus) {
    avatar().setStatus(state);
    visuallyHidden.setVisibility(state === NgpAvatarStatus.Loaded);
  }

  return {};
});
