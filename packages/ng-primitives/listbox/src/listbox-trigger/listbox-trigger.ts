import { Directive } from '@angular/core';
import { ngpListboxTrigger } from './listbox-trigger-state';

@Directive({
  selector: '[ngpListboxTrigger]',
  exportAs: 'ngpListboxTrigger',
})
export class NgpListboxTrigger {
  protected readonly state = ngpListboxTrigger({});

  /**
   * When the up or down arrow key is pressed, open the popover.
   */
  openPopover(event: KeyboardEvent) {
    return this.state.onPopover(event);
  }
}
