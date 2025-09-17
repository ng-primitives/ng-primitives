import { AfterViewInit, DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { fromMutationObserver } from '../../../internal/src';
import { safeTakeUntilDestroyed } from '../../../utils/src';
import { NgpThread } from '../thread/thread';

@Directive({
  selector: '[ngpThreadMessage]',
  exportAs: 'ngpThreadMessage',
})
export class NgpThreadMessage implements AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly thread = inject(NgpThread);

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
        // When content changes, check if we should maintain bottom scroll position
        this.thread.checkAndScrollToBottom(this);
      });

    this.thread.registerMessage(this);
    this.destroyRef.onDestroy(() => this.thread.unregisterMessage(this));
  }

  ngAfterViewInit() {
    this.thread.scrollToBottom();
  }
}
