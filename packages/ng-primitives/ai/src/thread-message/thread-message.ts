import { Directive } from '@angular/core';
import { ngpThreadMessagePattern, provideThreadMessagePattern } from './thread-message-pattern';

@Directive({
  selector: '[ngpThreadMessage]',
  exportAs: 'ngpThreadMessage',
  providers: [provideThreadMessagePattern(NgpThreadMessage, instance => instance.pattern)],
})
export class NgpThreadMessage {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpThreadMessagePattern({});
}
