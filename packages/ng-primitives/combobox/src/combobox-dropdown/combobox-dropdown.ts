import { Directive, input } from '@angular/core';
import { injectElementRef, observeResize } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';

@Directive({
  selector: '[ngpComboboxDropdown]',
  exportAs: 'ngpComboboxDropdown',
  host: {
    role: 'listbox',
    '[id]': 'id()',
    '[style.left.px]': 'state().overlay()?.position()?.x',
    '[style.top.px]': 'state().overlay()?.position()?.y',
    '[style.--ngp-combobox-transform-origin]': 'state().overlay()?.transformOrigin()',
    '[style.--ngp-combobox-available-width.px]': 'state().overlay()?.availableWidth()',
    '[style.--ngp-combobox-available-height.px]': 'state().overlay()?.availableHeight()',
    '[style.--ngp-combobox-width.px]': 'comboboxDimensions().width',
    '[style.--ngp-combobox-input-width.px]': 'inputDimensions().width',
    '[style.--ngp-combobox-button-width.px]': 'buttonDimensions().width',
  },
})
export class NgpComboboxDropdown {
  /** Access the combobox state. */
  protected readonly state = injectComboboxState();

  /** The dimensions of the combobox. */
  protected readonly comboboxDimensions = observeResize(
    () => this.state().elementRef.nativeElement,
  );

  /** The dimensions of the combobox. */
  protected readonly inputDimensions = observeResize(
    () => this.state().input()?.elementRef.nativeElement,
  );

  /** Store the combobox button dimensions. */
  protected readonly buttonDimensions = observeResize(
    () => this.state().button()?.elementRef.nativeElement,
  );

  /**
   * Access the element reference.
   * @internal
   */
  readonly elementRef = injectElementRef();

  /** The id of the dropdown. */
  readonly id = input<string>(uniqueId('ngp-combobox-dropdown'));

  constructor() {
    this.state().registerDropdown(this);
  }
}
