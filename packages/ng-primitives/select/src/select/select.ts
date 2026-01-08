import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  HostListener,
  inject,
  Injector,
  input,
  output,
  signal,
} from '@angular/core';
import type { Placement } from '@floating-ui/dom';
import { activeDescendantManager } from 'ng-primitives/a11y';
import { ngpFormControl } from 'ng-primitives/form-field';
import { ngpInteractions } from 'ng-primitives/interactions';
import { domSort, injectElementRef } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectConfig } from '../config/select-config';
import type { NgpSelectDropdown } from '../select-dropdown/select-dropdown';
import { NgpSelectOption } from '../select-option/select-option';
import type { NgpSelectPortal } from '../select-portal/select-portal';
import { provideSelectState, selectState } from './select-state';

/**
 * Ideally we would use a generic type here, unfortunately, unlike in React,
 * we cannot infer the type based on another input. For example, if multiple
 * is true, we cannot infer that the value is an array of T. Using a union
 * type is not ideal either because it requires the user to handle multiple cases.
 * Using a generic also isn't ideal because we need to use T as both an array and
 * a single value.
 *
 * Any seems to be used by Angular Material, ng-select, and other libraries
 * so we will use it here as well.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type T = any;

@Directive({
  selector: '[ngpSelect]',
  exportAs: 'ngpSelect',
  providers: [provideSelectState()],
  host: {
    role: 'combobox',
    '[id]': 'state.id()',
    '[attr.aria-expanded]': 'open()',
    '[attr.aria-controls]': 'open() ? dropdown()?.id() : undefined',
    '[attr.aria-activedescendant]': 'open() ? activeDescendantManager.id() : undefined',
    '[attr.tabindex]': 'state.disabled() ? -1 : 0',
    '[attr.data-open]': 'open() ? "" : undefined',
    '[attr.data-disabled]': 'state.disabled() ? "" : undefined',
    '[attr.data-multiple]': 'state.multiple() ? "" : undefined',
  },
})
export class NgpSelect {
  /** Access the select configuration. */
  protected readonly config = injectSelectConfig();

  /** @internal Access the select element. */
  readonly elementRef = injectElementRef();

  /** Access the injector. */
  protected readonly injector = inject(Injector);

  /** The unique id of the select. */
  readonly id = input(uniqueId('ngp-select'));

  /** The value of the select. */
  readonly value = input<T>(undefined, {
    alias: 'ngpSelectValue',
  });

  /** Event emitted when the value changes. */
  readonly valueChange = output<T>({
    alias: 'ngpSelectValueChange',
  });

  /** Whether the select is multiple selection. */
  readonly multiple = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectMultiple',
    transform: booleanAttribute,
  });

  /** Whether the select is disabled. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectDisabled',
    transform: booleanAttribute,
  });

  /** Emit when the dropdown open state changes. */
  readonly openChange = output<boolean>({
    alias: 'ngpSelectOpenChange',
  });

  /** The comparator function used to compare options. */
  readonly compareWith = input<(a: T | undefined, b: T | undefined) => boolean>(Object.is, {
    alias: 'ngpSelectCompareWith',
  });

  /** The position of the dropdown. */
  readonly placement = input<Placement>(this.config.placement, {
    alias: 'ngpSelectDropdownPlacement',
  });

  /** The container for the dropdown. */
  readonly container = input<HTMLElement | string | null>(this.config.container, {
    alias: 'ngpSelectDropdownContainer',
  });

  /**
   * A function that will scroll the active option into view. This can be overridden
   * for cases such as virtual scrolling where we cannot scroll the option directly because
   * it may not be rendered.
   */
  readonly scrollToOption = input<(index: number) => void>(undefined, {
    alias: 'ngpSelectScrollToOption',
  });

  /**
   * Provide all the option values to the select. This is useful for virtual scrolling scenarios
   * where not all options are rendered in the DOM. This is not an alternative to adding the options
   * in the DOM, it is only to provide the select with the full list of options. This list should match
   * the order of the options as they would appear in the DOM.
   */
  readonly allOptions = input<T[]>(undefined, { alias: 'ngpSelectOptions' });

  /**
   * Store the select portal.
   * @internal
   */
  readonly portal = signal<NgpSelectPortal | undefined>(undefined);

  /**
   * Store the select dropdown.
   * @internal
   */
  readonly dropdown = signal<NgpSelectDropdown | undefined>(undefined);

  /**
   * Store the select options.
   * @internal
   */
  readonly options = signal<NgpSelectOption[]>([]);

  /**
   * Access the overlay
   * @internal
   */
  readonly overlay = computed(() => this.portal()?.overlay());

  /**
   * The open state of the select.
   * @internal
   */
  readonly open = computed(() => this.overlay()?.isOpen() ?? false);

  /**
   * The options sorted by their index or DOM position.
   * @internal
   */
  readonly sortedOptions = computed(() =>
    domSort(
      this.options(),
      option => option.elementRef.nativeElement,
      option => option.index?.(),
    ),
  );

  /**
   * The active key descendant manager.
   * @internal
   */
  readonly activeDescendantManager = activeDescendantManager({
    // we must wrap the signal in a computed to ensure it is not used before it is defined
    disabled: computed(() => this.state.disabled()),
    count: computed(() => this.allOptions()?.length ?? this.options().length),
    getItemId: index => this.getOptionAtIndex(index)?.id(),
    isItemDisabled: index => this.getOptionAtIndex(index)?.disabled() ?? false,
    scrollIntoView: index => {
      const isPositioned = this.portal()?.overlay()?.isPositioned() ?? false;

      if (!isPositioned || index === -1) {
        return;
      }

      this.scrollTo(index);
    },
  });

  /** The state of the select. */
  protected readonly state = selectState<NgpSelect>(this);

  constructor() {
    ngpInteractions({
      focus: true,
      focusWithin: true,
      hover: true,
      press: true,
      disabled: this.state.disabled,
    });

    ngpFormControl({ id: this.state.id, disabled: this.state.disabled });
  }

  /**
   * Open the dropdown.
   * @internal
   */
  async openDropdown(): Promise<void> {
    if (this.state.disabled() || this.open()) {
      return;
    }

    this.openChange.emit(true);
    await this.portal()?.show();

    let selectedOptionIdx = -1;

    // if we have been provided with allOptions, we need to find the selected option(s) from that list
    if (this.allOptions()) {
      selectedOptionIdx = this.allOptions()!.findIndex(option => this.isOptionSelected(option));
    }

    // if we don't have allOptions, find the selected option(s) from the registered options
    if (selectedOptionIdx === -1) {
      // if there is a selected option(s), set the active descendant to the first selected option
      selectedOptionIdx = this.sortedOptions().findIndex(option =>
        this.isOptionSelected(option.value()),
      );
    }

    // if after checking there is a selected option, set the active descendant to the first option
    if (selectedOptionIdx !== -1) {
      // scroll to and activate the selected option
      this.scrollTo(selectedOptionIdx);
      this.activeDescendantManager.activateByIndex(selectedOptionIdx);
      return;
    }

    // activate the selected option or the first option
    this.activeDescendantManager.first();
  }

  /**
   * Close the dropdown.
   * @internal
   */
  closeDropdown(): void {
    if (!this.open()) {
      return;
    }

    this.openChange.emit(false);
    this.portal()?.detach();

    // clear the active descendant
    this.activeDescendantManager.reset();
  }

  /**
   * Toggle the dropdown.
   * @internal
   */
  @HostListener('click')
  async toggleDropdown(): Promise<void> {
    if (this.open()) {
      this.closeDropdown();
    } else {
      await this.openDropdown();
    }
  }

  /**
   * Select an option.
   * @param index The index of the option to select.
   * @internal
   */
  selectOption(id: string): void {
    if (this.state.disabled()) {
      return;
    }

    const option = this.sortedOptions().find(opt => opt.id() === id);

    if (!option) {
      this.state.value.set(undefined);
      this.closeDropdown();
      return;
    }

    if (this.state.multiple()) {
      // if the option is already selected, do nothing
      if (this.isOptionSelected(option.value())) {
        return;
      }

      const value = [...((this.state.value() ?? []) as T[]), option.value() as T];

      // add the option to the value
      this.state.value.set(value as T);
      this.valueChange.emit(value as T);
    } else {
      this.state.value.set(option.value() as T);
      this.valueChange.emit(option.value() as T);

      // close the dropdown on single selection
      this.closeDropdown();
    }
  }

  /**
   * Deselect an option.
   * @param option The option to deselect.
   * @internal
   */
  deselectOption(option: NgpSelectOption): void {
    // if the select is disabled or the option is not selected, do nothing
    // if the select is single selection, we don't allow deselecting
    if (this.state.disabled() || !this.isOptionSelected(option.value()) || !this.state.multiple()) {
      return;
    }

    const values = (this.state.value() as T[]) ?? [];

    const newValue = values.filter(v => !this.state.compareWith()(v, option.value() as T));

    // remove the option from the value
    this.state.value.set(newValue as T);
    this.valueChange.emit(newValue as T);
  }

  /**
   * Toggle the selection of an option.
   * @param id The id of the option to toggle.
   * @internal
   */
  toggleOption(id: string): void {
    if (this.state.disabled()) {
      return;
    }

    const option = this.sortedOptions().find(opt => opt.id() === id);

    if (!option) {
      return;
    }

    // if the state is single selection, we don't allow toggling
    if (!this.state.multiple()) {
      // always select the option in single selection mode even if it is already selected so that we update the input
      this.selectOption(id);
      return;
    }

    // otherwise toggle the option
    if (this.isOptionSelected(option.value())) {
      this.deselectOption(option);
    } else {
      this.selectOption(id);
    }
  }

  /**
   * Determine if an option is selected.
   * @param option The option to check.
   * @internal
   */
  isOptionSelected(option: T): boolean {
    if (this.state.disabled()) {
      return false;
    }

    const value = this.state.value();

    if (!value) {
      return false;
    }

    if (this.state.multiple()) {
      return value && (value as T[]).some(v => this.state.compareWith()(option, v));
    }

    return this.state.compareWith()(option, value);
  }

  /**
   * Activate the next option in the list if there is one.
   * If there is no option currently active, activate the selected option or the first option.
   * @internal
   */
  activateNextOption(): void {
    if (this.state.disabled()) {
      return;
    }

    const options = this.sortedOptions();

    // if there are no options, do nothing
    if (options.length === 0) {
      return;
    }

    // if there is no active option, activate the first option
    if (this.activeDescendantManager.index() === -1) {
      const selectedOption = options.findIndex(option => this.isOptionSelected(option.value()));

      // if there is a selected option(s), set the active descendant to the first selected option
      const targetOption = selectedOption !== -1 ? selectedOption : 0;

      this.activeDescendantManager.activateByIndex(targetOption);
      return;
    }

    // otherwise activate the next option
    this.activeDescendantManager.next();
  }

  /**
   * Activate the previous option in the list if there is one.
   * @internal
   */
  activatePreviousOption(): void {
    if (this.state.disabled()) {
      return;
    }
    const options = this.sortedOptions();
    // if there are no options, do nothing
    if (options.length === 0) {
      return;
    }
    // if there is no active option, activate the last option
    if (this.activeDescendantManager.index() === -1) {
      const selectedOption = options.findIndex(option => this.isOptionSelected(option.value()));
      // if there is a selected option(s), set the active descendant to the first selected option
      const targetOption = selectedOption !== -1 ? selectedOption : options.length - 1;
      this.activeDescendantManager.activateByIndex(targetOption);
      return;
    }
    // otherwise activate the previous option
    this.activeDescendantManager.previous();
  }

  /**
   * Register the dropdown portal with the select.
   * @param portal The dropdown portal.
   * @internal
   */
  registerPortal(portal: NgpSelectPortal): void {
    this.portal.set(portal);
  }

  /**
   * Register the dropdown with the select.
   * @param dropdown The dropdown to register.
   * @internal
   */
  registerDropdown(dropdown: NgpSelectDropdown): void {
    this.dropdown.set(dropdown);
  }

  /**
   * Register an option with the select.
   * @param option The option to register.
   * @internal
   */
  registerOption(option: NgpSelectOption): void {
    this.options.update(options => [...options, option]);
  }

  /**
   * Unregister an option from the select.
   * @param option The option to unregister.
   * @internal
   */
  unregisterOption(option: NgpSelectOption): void {
    this.options.update(options => options.filter(o => o !== option));
  }

  /**
   * Focus the select.
   * @internal
   */
  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  /** Handle keydown events for accessibility. */
  @HostListener('keydown', ['$event'])
  protected handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        if (this.open()) {
          this.activateNextOption();
        } else {
          this.openDropdown();
        }
        event.preventDefault();
        break;
      case 'ArrowUp':
        if (this.open()) {
          this.activatePreviousOption();
        } else {
          this.openDropdown();
          this.activeDescendantManager.last();
        }
        event.preventDefault();
        break;
      case 'Home':
        if (this.open()) {
          this.activeDescendantManager.first();
        }
        event.preventDefault();
        break;
      case 'End':
        if (this.open()) {
          this.activeDescendantManager.last();
        }
        event.preventDefault();
        break;
      case 'Enter':
        if (this.open()) {
          const activeId = this.activeDescendantManager.id();

          if (activeId) {
            this.selectOption(activeId);
          }
        } else {
          this.openDropdown();
        }
        event.preventDefault();
        break;
      case ' ':
        this.toggleDropdown();
        event.preventDefault();
        break;
    }
  }

  @HostListener('blur', ['$event'])
  protected onBlur(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget as HTMLElement;

    // if the blur was caused by focus moving to the dropdown, don't close
    if (relatedTarget && this.dropdown()?.elementRef.nativeElement.contains(relatedTarget)) {
      return;
    }

    this.closeDropdown();
    event.preventDefault();
  }

  private scrollTo(index: number): void {
    const scrollToOption = this.state.scrollToOption();

    if (scrollToOption) {
      scrollToOption(index);
      return;
    }

    this.sortedOptions()[index]?.scrollIntoView();
  }

  private getOptionAtIndex(index: number): NgpSelectOption | undefined {
    // if the option has an index, use that to get the option because this is required for virtual scrolling scenarios
    const optionIndex = this.options().findIndex(opt => opt.index?.() === index);

    if (optionIndex !== -1) {
      return this.options()[optionIndex];
    }

    return this.sortedOptions()[index];
  }
}
