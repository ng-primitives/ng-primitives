import { Directive } from '@angular/core';
import { ngpTabListPattern, provideTabListPattern } from './tab-list-pattern';

/**
 * Apply the `ngpTabList` directive to an element that represents the list of tab buttons.
 */
@Directive({
  selector: '[ngpTabList]',
  exportAs: 'ngpTabList',
  providers: [provideTabListPattern(NgpTabList, instance => instance.pattern)],
})
export class NgpTabList {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpTabListPattern();
}
