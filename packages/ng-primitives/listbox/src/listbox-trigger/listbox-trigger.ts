import { Directive, HostListener } from '@angular/core';
import { injectPopoverTriggerState } from 'ng-primitives/popover';

@Directive({
  selector: '[ngpListboxTrigger]',
  exportAs: 'ngpListboxTrigger',
})
export class NgpListboxTrigger {
  /**
   * Automatically detect a co-located popover trigger to open on arrow key press.
   */
  private readonly popoverTrigger = injectPopoverTriggerState({ optional: true });

  /**
   * When the up or down arrow key is pressed, open the popover.
   */
  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      this.popoverTrigger()?.show();
      event.preventDefault();
    }
  }
}
