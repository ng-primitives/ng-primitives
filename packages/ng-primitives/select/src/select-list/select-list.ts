import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpSelectList } from './select-list-state';

@Directive({
  selector: '[ngpSelectList]',
  exportAs: 'ngpSelectList',
})
export class NgpSelectList {
  /** The id of the list. */
  readonly id = input<string>(uniqueId('ngp-select-list'));

  constructor() {
    ngpSelectList({
      id: this.id,
    });
  }
}
