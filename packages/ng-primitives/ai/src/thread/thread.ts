import { Directive } from '@angular/core';
import { ngpThreadPattern, provideThreadPattern } from './thread-pattern';

@Directive({
  selector: '[ngpThread]',
  exportAs: 'ngpThread',
  providers: [provideThreadPattern(NgpThread, instance => instance.pattern)],
})
export class NgpThread {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpThreadPattern();

  scrollToBottom(behavior: ScrollBehavior): void {
    this.pattern.scrollToBottom(behavior);
  }
}
