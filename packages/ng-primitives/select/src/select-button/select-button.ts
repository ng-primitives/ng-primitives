import { computed, Directive, HostListener, input } from '@angular/core';
import { injectElementRef, setupInteractions } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectState } from '../select/select-state';

@Directive({
  selector: '[ngpSelectButton]',
  exportAs: 'ngpSelectButton',
  host: {
    type: 'button',
    tabindex: '-1',
    'aria-haspopup': 'listbox',
    '[id]': 'id()',
    '[attr.aria-controls]': 'state.id()',
    '[attr.aria-expanded]': 'state().open()',
    '[attr.data-open]': 'state().open() ? "" : undefined',
    '[attr.data-disabled]': 'state().disabled() ? "" : undefined',
    '[attr.data-multiple]': 'state().multiple() ? "" : undefined',
    '[disabled]': 'state().disabled()',
  },
})
export class NgpSelectButton {
  /** Access the select state. */
  protected readonly state = injectSelectState();

  /**
   * Access the element reference.
   * @internal
   */
  readonly elementRef = injectElementRef<HTMLButtonElement>();

  /** The id of the button. */
  readonly id = input<string>(uniqueId('ngp-select-button'));

  /** The id of the dropdown. */
  readonly dropdownId = computed(() => this.state().dropdown()?.id());

  constructor() {
    setupInteractions({
      hover: true,
      press: true,
      disabled: this.state().disabled,
    });

    this.state().registerButton(this);
  }

  @HostListener('click')
  protected async toggleDropdown(): Promise<void> {
    await this.state().toggleDropdown();
    this.state()?.focus();
  }
}
