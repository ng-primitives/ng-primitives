import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpComboboxList, provideComboboxListState } from './combobox-list-state';

@Directive({
  selector: '[ngpComboboxList]',
  exportAs: 'ngpComboboxList',
  providers: [provideComboboxListState()],
})
export class NgpComboboxList {
  /** The id of the list. */
  readonly id = input<string>(uniqueId('ngp-combobox-list'));

  protected readonly state = ngpComboboxList({ id: this.id });
}
