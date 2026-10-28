import { computed, Directive, HostListener, input } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectAutocompleteState } from '../autocomplete/autocomplete-state';

@Directive({
  selector: 'button[ngpAutocompleteButton]',
  exportAs: 'ngpAutocompleteButton',
  host: {
    type: 'button',
    tabindex: '-1',
    'aria-haspopup': 'listbox',
    '[id]': 'id()',
    '[attr.aria-controls]': 'dropdownId()',
    '[attr.aria-expanded]': 'state().open()',
    '[attr.data-open]': 'state().open() ? "" : undefined',
    '[attr.data-disabled]': 'state().disabled() ? "" : undefined',
    '[disabled]': 'state().disabled()',
  },
})
export class NgpAutocompleteButton {
  /** Access the autocomplete state. */
  protected readonly state = injectAutocompleteState();

  /**
   * Access the element reference.
   * @internal
   */
  readonly elementRef = injectElementRef<HTMLButtonElement>();

  /** The id of the button. */
  readonly id = input<string>(uniqueId('ngp-autocomplete-button'));

  /** The id of the dropdown. */
  readonly dropdownId = computed(() => this.state().dropdown()?.id());

  constructor() {
    ngpInteractions({
      hover: true,
      press: true,
      disabled: this.state().disabled,
    });

    this.state().registerButton(this);
  }

  @HostListener('click')
  protected async toggleDropdown(): Promise<void> {
    await this.state().toggleDropdown();
    this.state().input()?.focus();
  }
}
