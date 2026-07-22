import { Directive } from '@angular/core';
import { ngpThread, provideThreadState } from './thread-state';

@Directive({
  selector: '[ngpThread]',
  exportAs: 'ngpThread',
  providers: [provideThreadState()],
})
export class NgpThread {
  /** The state of the thread. */
  protected readonly state = ngpThread();

  /**
   * Scroll the thread viewport to the bottom.
   * @param behavior The scroll behavior to use.
   */
  scrollToBottom(behavior: ScrollBehavior): void {
    this.state.scrollToBottom(behavior);
  }

  /**
   * Set the prompt text in the associated prompt composer.
   * @param value The prompt text.
   */
  setPrompt(value: string): void {
    this.state.setPrompt(value);
  }
}
