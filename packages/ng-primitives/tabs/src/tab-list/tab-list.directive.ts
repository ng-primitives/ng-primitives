import { Directive } from '@angular/core';
import { injectTabset } from '../tabset/tabset.token';

@Directive({
  standalone: true,
  selector: '[ngpTabList]',
  exportAs: 'ngpTabList',
  host: {
    role: 'tablist',
    '[attr.aria-orientation]': 'tabset.orientation()',
    '[attr.data-orientation]': 'tabset.orientation()',
  },
})
export class NgpTabListDirective {
  /**
   * Access the tabset
   */
  protected readonly tabset = injectTabset();
}
