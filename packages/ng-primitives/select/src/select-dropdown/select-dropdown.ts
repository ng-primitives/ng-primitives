import { Directive, input } from '@angular/core';
import { injectElementRef, observeResize } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectState } from '../select/select-state';

@Directive({
  selector: '[ngpSelectDropdown]',
  exportAs: 'ngpSelectDropdown',
  host: {
    role: 'listbox',
    '[id]': 'id()',
    '[style.left.px]': 'state().overlay()?.position()?.x',
    '[style.top.px]': 'state().overlay()?.position()?.y',
    '[style.--ngp-select-transform-origin]': 'state().overlay()?.transformOrigin()',
    '[style.--ngp-select-width.px]': 'selectDimensions().width',
  },
})
export class NgpSelectDropdown {
  /** Access the select state. */
  protected readonly state = injectSelectState();

  /** The dimensions of the select. */
  protected readonly selectDimensions = observeResize(() => this.state().elementRef.nativeElement);

  /**
   * Access the element reference.
   * @internal
   */
  readonly elementRef = injectElementRef();

  /** The id of the dropdown. */
  readonly id = input<string>(uniqueId('ngp-select-dropdown'));

  constructor() {
    this.state().registerDropdown(this);
  }
}
