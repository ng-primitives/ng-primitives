import { BooleanInput } from '@angular/cdk/coercion';
import {
  afterRenderEffect,
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
import { setupFormControl } from 'ng-primitives/form-field';
import { injectElementRef, setupInteractions } from 'ng-primitives/internal';
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
    '[attr.aria-expanded]': 'state.open()',
    '[attr.aria-controls]': 'state.open() ? state.dropdown()?.id() : undefined',
    '[attr.aria-activedescendant]':
      'state.open() ? activeDescendantManager.activeDescendant() : undefined',
    '[attr.tabindex]': 'state.disabled() ? -1 : 0',
    '[attr.data-open]': 'state.open() ? "" : undefined',
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
  readonly container = input<HTMLElement | null>(this.config.container, {
    alias: 'ngpSelectDropdownContainer',
  });

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
   * The active key descendant manager.
   * @internal
   */
  readonly activeDescendantManager = activeDescendantManager({
    // we must wrap the signal in a computed to ensure it is not used before it is defined
    disabled: computed(() => this.state.disabled()),
    items: this.options,
  });

  /** The state of the select. */
  protected readonly state = selectState<NgpSelect>(this);

  constructor() {
    setupInteractions({
      focus: true,
      focusWithin: true,
      hover: true,
      press: true,
      disabled: this.state.disabled,
    });

    setupFormControl({ id: this.state.id, disabled: this.state.disabled });

    // any time the active descendant changes, ensure we scroll it into view
    // perform after next render to ensure the DOM is updated
    // e.g. the dropdown is open before the option is scrolled into view
    afterRenderEffect({
      write: () => {
        const isPositioned = this.portal()?.overlay()?.isPositioned() ?? false;
        const activeItem = this.activeDescendantManager.activeItem();

        if (!isPositioned || !activeItem) {
          return;
        }

        this.activeDescendantManager.activeItem()?.scrollIntoView?.();
      },
    });
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

    // if there is a selected option(s), set the active descendant to the first selected option
    const selectedOption = this.options().find(option => this.isOptionSelected(option));

    // if there is no selected option, set the active descendant to the first option
    const targetOption = selectedOption ?? this.options()[0];

    // if there is no target option, do nothing
    if (!targetOption) {
      return;
    }

    // activate the selected option or the first option
    this.activeDescendantManager.activate(targetOption);
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
   * @param option The option to select.
   * @internal
   */
  selectOption(option: NgpSelectOption | undefined): void {
    if (this.state.disabled()) {
      return;
    }

    if (!option) {
      this.state.value.set(undefined);
      this.closeDropdown();
      return;
    }

    if (this.state.multiple()) {
      // if the option is already selected, do nothing
      if (this.isOptionSelected(option)) {
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
    if (this.state.disabled() || !this.isOptionSelected(option) || !this.state.multiple()) {
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
   * @param option The option to toggle.
   * @internal
   */
  toggleOption(option: NgpSelectOption): void {
    if (this.state.disabled()) {
      return;
    }

    // if the state is single selection, we don't allow toggling
    if (!this.state.multiple()) {
      // always select the option in single selection mode even if it is already selected so that we update the input
      this.selectOption(option);
      return;
    }

    // otherwise toggle the option
    if (this.isOptionSelected(option)) {
      this.deselectOption(option);
    } else {
      this.selectOption(option);
    }
  }

  /**
   * Determine if an option is selected.
   * @param option The option to check.
   * @internal
   */
  isOptionSelected(option: NgpSelectOption): boolean {
    if (this.state.disabled()) {
      return false;
    }

    const value = this.state.value();

    if (!value) {
      return false;
    }

    if (this.state.multiple()) {
      return value && (value as T[]).some(v => this.state.compareWith()(option.value(), v));
    }

    return this.state.compareWith()(option.value(), value);
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

    const options = this.options();

    // if there are no options, do nothing
    if (options.length === 0) {
      return;
    }

    // if there is no active option, activate the first option
    if (!this.activeDescendantManager.activeItem()) {
      const selectedOption = options.find(option => this.isOptionSelected(option));

      // if there is a selected option(s), set the active descendant to the first selected option
      const targetOption = selectedOption ?? options[0];

      this.activeDescendantManager.activate(targetOption);
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
    const options = this.options();
    // if there are no options, do nothing
    if (options.length === 0) {
      return;
    }
    // if there is no active option, activate the last option
    if (!this.activeDescendantManager.activeItem()) {
      const selectedOption = options.find(option => this.isOptionSelected(option));
      // if there is a selected option(s), set the active descendant to the first selected option
      const targetOption = selectedOption ?? options[options.length - 1];
      this.activeDescendantManager.activate(targetOption);
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
          this.selectOption(this.activeDescendantManager.activeItem());
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
}
