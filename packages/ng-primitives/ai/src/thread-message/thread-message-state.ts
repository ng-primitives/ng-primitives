import { fromMutationObserver, injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, onDestroy } from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { injectThreadState } from '../thread/thread-state';

export interface NgpThreadMessageState {}

export const [
  NgpThreadMessageStateToken,
  ngpThreadMessage,
  injectThreadMessageState,
  provideThreadMessageState,
] = createPrimitive('NgpThreadMessage', (): NgpThreadMessageState => {
  const element = injectElementRef<HTMLElement>();
  const thread = injectThreadState();

  // Identity token for this message. The thread orders messages by registration order,
  // so a stable per-message reference is all it needs.
  const state: NgpThreadMessageState = {};

  // Watch for content changes (like streaming text) and maintain scroll position
  fromMutationObserver(element.nativeElement, {
    childList: true, // Watch for new/removed child nodes
    subtree: true, // Watch changes in all descendants
    characterData: true, // Watch for text content changes in text nodes
    attributes: false, // We don't care about attribute changes for content streaming
  })
    .pipe(safeTakeUntilDestroyed())
    .subscribe(() => {
      // follow the stream only while the user is still at the bottom, so it does not pull
      // them away from an earlier message they are reading
      if (thread().isLastMessage(state)) {
        thread().scrollToBottomIfNeeded('smooth');
      }
    });

  thread().registerMessage(state);
  onDestroy(() => thread().unregisterMessage(state));

  return state;
});
