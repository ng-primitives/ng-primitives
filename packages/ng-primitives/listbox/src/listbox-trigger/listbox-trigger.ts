import { Directive, HostListener } from '@angular/core';
import { injectPopoverTrigger } from 'ng-primitives/popover';
import { NgpListboxTriggerToken } from './listbox-trigger-token';

@Directive({
  selector: '[ngpListboxTrigger]',
  exportAs: 'ngpListboxTrigger',
  providers: [{ provide: NgpListboxTriggerToken, useExisting: NgpListboxTrigger }],
})
export class NgpListboxTrigger {
  /**
   * There must also be a popover trigger directive associated with this element.
   */
  private readonly popoverTrigger = injectPopoverTrigger();

  /**
   * When the up or down arrow key is pressed, open the popover.
   */
  @HostListener('keydown', ['$event'])
  openPopover(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      this.popoverTrigger.show('keyboard');
      event.preventDefault();
    }
  }
}
