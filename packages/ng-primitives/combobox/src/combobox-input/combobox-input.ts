import { computed, Directive, HostListener, input } from '@angular/core';
import { setupFormControl } from 'ng-primitives/form-field';
import { injectElementRef, setupInteractions } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';

@Directive({
  selector: 'input[ngpComboboxInput]',
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
    '[attr.aria-expanded]': 'state().open()',
    '[attr.data-open]': 'state().open() ? "" : undefined',
    '[attr.data-disabled]': 'state().disabled() ? "" : undefined',
    '[attr.data-multiple]': 'state().multiple() ? "" : undefined',
    '[attr.aria-activedescendant]': 'activeDescendant()',
    '[disabled]': 'state().disabled()',
  },
})
export class NgpComboboxInput {
  /** Access the combobox state. */
  protected readonly state = injectComboboxState();

  /**
   * Access the element reference.
   * @internal
   */
  readonly elementRef = injectElementRef<HTMLInputElement>();

  /** The id of the input. */
  readonly id = input<string>(uniqueId('ngp-combobox-input'));

  /** The id of the dropdown. */
  readonly dropdownId = computed(() => this.state().dropdown()?.id());

  /** The id of the active descendant. */
  protected readonly activeDescendant = computed(() =>
    this.state().activeDescendantManager.activeDescendant(),
  );

  /** Determine if the pointer was used to focus the input. */
  protected pointerFocused = false;

  constructor() {
    setupInteractions({
      focus: true,
      hover: true,
      press: true,
      disabled: this.state().disabled,
    });

    setupFormControl({ id: this.id, disabled: this.state().disabled });

    this.state().registerInput(this);
  }

  /** Handle keydown events for accessibility. */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        if (this.state().open()) {
          this.state().activateNextOption();
        } else {
          this.state().openDropdown();
        }
        event.preventDefault();
        break;
      case 'ArrowUp':
        if (this.state().open()) {
          this.state().activatePreviousOption();
        } else {
          this.state().openDropdown();
          this.state().activeDescendantManager.last();
        }
        event.preventDefault();
        break;
      case 'Home':
        if (this.state().open()) {
          this.state().activeDescendantManager.first();
        }
        event.preventDefault();
        break;
      case 'End':
        if (this.state().open()) {
          this.state().activeDescendantManager.last();
        }
        event.preventDefault();
        break;
      case 'Enter':
        if (this.state().open()) {
          this.state().selectOption(this.state().activeDescendantManager.activeItem());
        }
        event.preventDefault();
        break;
      case 'Escape':
        this.state().closeDropdown();
        event.preventDefault();
        break;
      case 'Backspace':
        // if the input is not empty then open the dropdown
        if (this.elementRef.nativeElement.value.length > 0) {
          this.state().openDropdown();
        }
        break;
      default:
        // Ignore keys with length > 1 (e.g., 'Shift', 'ArrowLeft', 'Enter', etc.)
        // Filter out control/meta key combos (e.g., Ctrl+C)
        if (event.key.length > 1 || event.ctrlKey || event.metaKey || event.altKey) {
          return;
        }

        // if this was a character key, we want to open the dropdown
        this.state().openDropdown();
    }
  }

  @HostListener('blur', ['$event'])
  protected closeDropdown(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;

    // if the blur was caused by focus moving to the dropdown, don't close
    if (
      relatedTarget &&
      this.state().dropdown()?.elementRef.nativeElement.contains(relatedTarget)
    ) {
      return;
    }

    // if the blur was caused by focus moving to the button, don't close
    if (relatedTarget && this.state().button()?.elementRef.nativeElement.contains(relatedTarget)) {
      return;
    }

    this.state().closeDropdown();
    event.preventDefault();
  }

  /**
   * Focus the input field
   * @internal
   */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  @HostListener('focus', ['$event'])
  protected highlightText(): void {
    if (this.pointerFocused) {
      this.pointerFocused = false;
      return;
    }

    // highlight the text in the input
    this.elementRef.nativeElement.setSelectionRange(0, this.elementRef.nativeElement.value.length);
  }

  @HostListener('pointerdown', ['$event'])
  protected handlePointerDown(): void {
    this.pointerFocused = true;
  }
}
