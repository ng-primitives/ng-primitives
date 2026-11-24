import { computed, Directive, input } from '@angular/core';
import { injectElementRef, observeResize } from 'ng-primitives/internal';
import { provideControlContainerIsolation } from 'ng-primitives/portal';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';
import { needsFocusOnPress } from '../utils';

@Directive({
  selector: '[ngpComboboxDropdown]',
  exportAs: 'ngpComboboxDropdown',
  providers: [provideControlContainerIsolation()],
  host: {
    '[attr.role]': 'isListbox() ? "listbox" : null',
    '[id]': 'id()',
    '[attr.aria-multiselectable]': 'isListbox() ? state().multiple() : null',
    '(mousedown)': 'keepFocusOnPress($event)',
    '[attr.data-reference-hidden]': 'state().overlay()?.referenceHidden() ? "" : null',
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

  /** Whether the dropdown is the listbox: an ngpComboboxList takes that over, with its attributes. */
  protected readonly isListbox = computed(() => !this.state().list());

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
    // The combobox's own overlay, not one injected: a dropdown rendered in place would find an
    // enclosing overlay and replace that overlay's properties.
    this.state().overlay()?.registerAvailableSizePrefix('--ngp-combobox');
  }

  /**
   * With a list, the dropdown holds content beside the options, and a press that moved focus onto
   * it, or to nothing, would take the keys from the combobox. The press still clicks.
   */
  protected keepFocusOnPress(event: MouseEvent): void {
    if (this.state().list() && !needsFocusOnPress(event.target)) {
      event.preventDefault();
    }
  }
}
