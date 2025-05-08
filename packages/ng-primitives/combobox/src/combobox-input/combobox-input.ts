import { computed, Directive, HostListener, input } from '@angular/core';
import { setupInteractions } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';

@Directive({
  selector: '[ngpComboboxInput]',
  exportAs: 'ngpComboboxInput',
  host: {
    role: 'combobox',
    type: 'text',
    autocomplete: 'off',
    autocorrect: 'off',
    spellcheck: 'false',
    'aria-haspopup': 'listbox',
    'aria-autocomplete': 'list',
    '[id]': 'id()',
    '[attr.aria-controls]': 'state().open() ? dropdownId() : undefined',
    '[attr.aria-expanded]': 'state().open() ? "true" : undefined',
    '[attr.data-open]': 'state().open() ? "" : undefined',
    '[attr.data-disabled]': 'state().disabled() ? "" : undefined',
    '[attr.data-multiple]': 'state().multiple() ? "" : undefined',
    '[disabled]': 'state().disabled()',
  },
})
export class NgpComboboxInput {
  /** Access the combobox state. */
  protected readonly state = injectComboboxState();

  /** The id of the input. */
  readonly id = input<string>(uniqueId('ngp-combobox-input'));

  /** The id of the dropdown. */
  readonly dropdownId = computed(() => this.state().dropdown()?.id());

  constructor() {
    setupInteractions({
      focus: true,
      hover: true,
      press: true,
      disabled: this.state().disabled,
    });

    this.state().registerInput(this);
  }

  /** Handle keydown events for accessibility. */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        this.state().openDropdown();
        event.preventDefault();
        break;
      case 'ArrowUp':
        // this.state().navigateOptions('up');
        event.preventDefault();
        break;
      case 'Enter':
        // this.state().selectHighlightedOption();
        event.preventDefault();
        break;
      case 'Escape':
        this.state().closeDropdown();
        event.preventDefault();
        break;
    }
  }

  @HostListener('blur')
  protected closeDropdown(): void {
    this.state().closeDropdown();
  }
}
