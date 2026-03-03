import { Directive, input } from '@angular/core';
import { observeResize } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectState } from '../select/select-state';
import { ngpSelectDropdown } from './select-dropdown-state';

@Directive({
  selector: '[ngpSelectDropdown]',
  exportAs: 'ngpSelectDropdown',
})
export class NgpSelectDropdown {
  /** Access the parent select state. */
  protected readonly selectState = injectSelectState();

  /** The id of the dropdown. */
  readonly id = input<string>(uniqueId('ngp-select-dropdown'));

  /** The dimensions of the select. */
  protected readonly selectDimensions = observeResize(
    () => this.selectState().elementRef.nativeElement,
  );

  /** Access the dropdown state. */
  protected readonly dropdownState = ngpSelectDropdown({
    id: this.id,
  });

  constructor() {
    this.selectState().registerDropdown(this);
  }

  elementRef = this.dropdownState.elementRef;
}
