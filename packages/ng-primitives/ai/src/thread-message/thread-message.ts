import { Directive } from '@angular/core';
import { ngpThreadMessage, provideThreadMessageState } from './thread-message-state';

@Directive({
  selector: '[ngpThreadMessage]',
  exportAs: 'ngpThreadMessage',
  providers: [provideThreadMessageState()],
})
export class NgpThreadMessage {
  /** The state of the thread message. */
  protected readonly state = ngpThreadMessage();
}
