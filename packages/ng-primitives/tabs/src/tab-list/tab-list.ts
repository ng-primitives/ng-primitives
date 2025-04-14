import { Directive } from '@angular/core';
import { injectTabsetState } from '../tabset/tabset-state';

/**
 * Apply the `ngpTabList` directive to an element that represents the list of tab buttons.
 */
@Directive({
  selector: '[ngpTabList]',
  exportAs: 'ngpTabList',
  host: {
    role: 'tablist',
    '[attr.aria-orientation]': 'state().orientation()',
    '[attr.data-orientation]': 'state().orientation()',
  },
})
export class NgpTabList {
  /**
   * Access the tabset state
   */
  protected readonly state = injectTabsetState();
}
