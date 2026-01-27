import { computed, Directive, HostListener, input } from '@angular/core';
import { ngpButton } from 'ng-primitives/button';
import { injectElementRef } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';

@Directive({
  selector: 'button[ngpComboboxButton]',
  exportAs: 'ngpComboboxButton',
  host: {
    'aria-haspopup': 'listbox',
    '[id]': 'id()',
    '[attr.aria-controls]': 'dropdownId()',
    '[attr.aria-expanded]': 'state().open()',
    '[attr.data-open]': 'state().open() ? "" : undefined',
    '[attr.data-multiple]': 'state().multiple() ? "" : undefined',
  },
})
export class NgpComboboxButton {
  /** Access the combobox state. */
  protected readonly state = injectComboboxState();

  /**
   * Access the element reference.
   * @internal
   */
  readonly elementRef = injectElementRef<HTMLButtonElement>();

  /** The id of the button. */
  readonly id = input<string>(uniqueId('ngp-combobox-button'));

  /** The id of the dropdown. */
  readonly dropdownId = computed(() => this.state().dropdown()?.id());

  constructor() {
    ngpButton({ disabled: this.state().disabled, type: 'button', tabIndex: -1 });
    this.state().registerButton(this);
  }

  @HostListener('click')
  protected async toggleDropdown(): Promise<void> {
    await this.state().toggleDropdown();
    this.state().input()?.focus();
  }
}
