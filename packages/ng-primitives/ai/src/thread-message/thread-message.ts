import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { fromMutationObserver } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { injectThreadState } from '../thread/thread-state';
import { provideThreadMessageState, threadMessageState } from './thread-message-state';

@Directive({
  selector: '[ngpThreadMessage]',
  exportAs: 'ngpThreadMessage',
  providers: [provideThreadMessageState()],
})
export class NgpThreadMessage {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly thread = injectThreadState();

  /** The state of the thread message. */
  protected readonly state = threadMessageState<NgpThreadMessage>(this);

  constructor() {
    // Watch for content changes (like streaming text) and maintain scroll position
    fromMutationObserver(this.elementRef.nativeElement, {
      childList: true, // Watch for new/removed child nodes
      subtree: true, // Watch changes in all descendants
      characterData: true, // Watch for text content changes in text nodes
      attributes: false, // We don't care about attribute changes for content streaming
    })
      .pipe(safeTakeUntilDestroyed())
      .subscribe(() => {
        // if this is the last message, scroll to bottom
        if (this.thread().isLastMessage(this)) {
          this.thread().scrollToBottom('smooth');
        }
      });

    this.thread().registerMessage(this);
    this.destroyRef.onDestroy(() => this.thread().unregisterMessage(this));
  }
}
