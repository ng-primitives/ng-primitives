import { AfterViewInit, Directive, inject } from '@angular/core';
import { NgpThread } from '../thread/thread';

@Directive({
  selector: '[ngpThreadMessage]',
  exportAs: 'ngpThreadMessage',
})
export class NgpThreadMessage implements AfterViewInit {
  private readonly thread = inject(NgpThread);

  ngAfterViewInit() {
    this.thread.scrollToBottom();
  }
}
