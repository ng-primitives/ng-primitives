import { Directive, HostListener } from '@angular/core';
import { injectPopoverTriggerState } from 'ng-primitives/popover';

@Directive({
  selector: '[ngpListboxTrigger]',
  exportAs: 'ngpListboxTrigger',
})
export class NgpListboxTrigger {
  /**
   * There must also be a popover trigger directive associated with this element.
   */
  private readonly popoverTrigger = injectPopoverTriggerState();

  /**
   * When the up or down arrow key is pressed, open the popover.
   */
  @HostListener('keydown', ['$event'])
  openPopover(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      this.popoverTrigger().show('keyboard');
      event.preventDefault();
    }
  }
}
