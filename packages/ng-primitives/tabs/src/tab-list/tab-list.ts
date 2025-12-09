import { Directive } from '@angular/core';
import { ngpTabList, provideTabListState } from './tab-list-state';

/**
 * Apply the `ngpTabList` directive to an element that represents the list of tab buttons.
 */
@Directive({
  selector: '[ngpTabList]',
  exportAs: 'ngpTabList',
  providers: [provideTabListState()],
})
export class NgpTabList {
  constructor() {
    ngpTabList({});
  }
}
