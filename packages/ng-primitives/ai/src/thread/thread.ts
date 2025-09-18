import { Directive } from '@angular/core';
import { Subject } from 'rxjs';
import { NgpThreadMessage } from '../thread-message/thread-message';
import { provideThreadState, threadState } from './thread-state';

@Directive({
  selector: '[ngpThread]',
  exportAs: 'ngpThread',
  providers: [provideThreadState()],
})
export class NgpThread {
  private messages: NgpThreadMessage[] = [];

  /** @internal emit event to trigger scrolling to bottom */
  readonly scrollRequest = new Subject<ScrollBehavior>();

  /** @internal emit event to trigger setting the prompt */
  readonly requestPrompt = new Subject<string>();

  /** The state of the thread. */
  protected readonly state = threadState<NgpThread>(this);

  scrollToBottom(behavior: ScrollBehavior): void {
    this.scrollRequest.next(behavior);
  }

  /** @internal Register a message with the thread */
  registerMessage(message: NgpThreadMessage): void {
    this.messages.push(message);
  }

  /** @internal Unregister a message from the thread */
  unregisterMessage(message: NgpThreadMessage): void {
    this.messages = this.messages.filter(m => m !== message);
  }

  /** @internal Determine if the given message is the last message in the thread */
  isLastMessage(message: NgpThreadMessage): boolean {
    return this.messages.length > 0 && this.messages[this.messages.length - 1] === message;
  }

  setPrompt(value: string): void {
    this.requestPrompt.next(value);
  }
}
