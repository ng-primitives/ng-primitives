import { Directive, input } from '@angular/core';
import { injectElementRef, observeResize } from 'ng-primitives/internal';
import { provideControlContainerIsolation } from 'ng-primitives/portal';
import { uniqueId } from 'ng-primitives/utils';
import { injectAutocompleteState } from '../autocomplete/autocomplete-state';

@Directive({
  selector: '[ngpAutocompleteDropdown]',
  exportAs: 'ngpAutocompleteDropdown',
  providers: [provideControlContainerIsolation()],
  host: {
    role: 'listbox',
    '[id]': 'id()',
    '[style.left.px]': 'state().overlay()?.position()?.x',
    '[style.top.px]': 'state().overlay()?.position()?.y',
    '[style.--ngp-autocomplete-transform-origin]': 'state().overlay()?.transformOrigin()',
    '[style.--ngp-autocomplete-available-width.px]': 'state().overlay()?.availableWidth()',
    '[style.--ngp-autocomplete-available-height.px]': 'state().overlay()?.availableHeight()',
    '[style.--ngp-autocomplete-width.px]': 'autocompleteDimensions().width',
    '[style.--ngp-autocomplete-input-width.px]': 'inputDimensions().width',
    '[style.--ngp-autocomplete-button-width.px]': 'buttonDimensions().width',
  },
})
export class NgpAutocompleteDropdown {
  /** Access the autocomplete state. */
  protected readonly state = injectAutocompleteState();

  /** The dimensions of the autocomplete. */
  protected readonly autocompleteDimensions = observeResize(
    () => this.state().elementRef.nativeElement,
  );

  /** The dimensions of the autocomplete input. */
  protected readonly inputDimensions = observeResize(
    () => this.state().input()?.elementRef.nativeElement,
  );

  /** Store the autocomplete button dimensions. */
  protected readonly buttonDimensions = observeResize(
    () => this.state().button()?.elementRef.nativeElement,
  );

  /**
   * Access the element reference.
   * @internal
   */
  readonly elementRef = injectElementRef();

  /** The id of the dropdown. */
  readonly id = input<string>(uniqueId('ngp-autocomplete-dropdown'));

  constructor() {
    this.state().registerDropdown(this);
  }
}
