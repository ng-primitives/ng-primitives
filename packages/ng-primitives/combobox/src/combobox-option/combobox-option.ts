import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  HostListener,
  input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NgpActivatable } from 'ng-primitives/a11y';
import { setupInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';
import { areAllOptionsSelected } from '../utils';

@Directive({
  selector: '[ngpComboboxOption]',
  exportAs: 'ngpComboboxOption',
  host: {
    role: 'option',
    '[id]': 'id()',
    '[attr.tabindex]': '-1',
    '[attr.aria-selected]': 'selected() ? "true" : undefined',
    '[attr.data-selected]': 'selected() ? "" : undefined',
    '[attr.data-active]': 'active() ? "" : undefined',
    '[attr.data-disabled]': 'disabled() ? "" : undefined',
    '(click)': 'select()',
  },
})
export class NgpComboboxOption implements OnInit, OnDestroy, NgpActivatable {
  /** Access the combobox state. */
  protected readonly state = injectComboboxState();

  /**
   * The element reference of the option.
   * @internal
   */
  readonly elementRef = injectElementRef();

  /** The id of the option. */
  readonly id = input<string>(uniqueId('ngp-combobox-option'));

  /** @required The value of the option. */
  readonly value = input<any>(undefined, {
    alias: 'ngpComboboxOptionValue',
  });

  /** The disabled state of the option. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpComboboxOptionDisabled',
    transform: booleanAttribute,
  });

  /**
   * Whether this option is the active descendant.
   * @internal
   */
  protected readonly active = computed(
    () => this.state().activeDescendantManager.activeDescendant() === this.id(),
  );

  /** Whether this option is selected. */
  protected readonly selected = computed(() => {
    const value = this.value();
    const stateValue = this.state().value();

    if (!value) {
      return false;
    }

    // Handle select all functionality - only works in multiple selection mode
    if (value === 'all') {
      if (!this.state().multiple()) {
        return false; // Never selected in single selection mode
      }

      const selectedValues = Array.isArray(stateValue) ? stateValue : [];
      return areAllOptionsSelected(
        this.state().options(),
        selectedValues,
        this.state().compareWith(),
      );
    }

    if (!stateValue) {
      return false;
    }

    if (this.state().multiple()) {
      return (
        Array.isArray(stateValue) && stateValue.some(v => this.state().compareWith()(value, v))
      );
    }

    return this.state().compareWith()(value, stateValue);
  });

  constructor() {
    this.state().registerOption(this);

    setupInteractions({
      hover: true,
      press: true,
      disabled: this.disabled,
    });
  }

  ngOnInit(): void {
    if (this.value() === undefined) {
      throw new Error(
        'ngpComboboxOption: The value input is required. Please provide a value for the option.',
      );
    }
  }

  ngOnDestroy(): void {
    this.state().unregisterOption(this);
  }

  /**
   * Select the option.
   * @internal
   */
  select(): void {
    if (this.disabled()) {
      return;
    }

    this.state().toggleOption(this);
  }

  /**
   * Scroll the option into view.
   * @internal
   */
  scrollIntoView(): void {
    this.elementRef.nativeElement.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Whenever the pointer enters the option, activate it.
   * @internal
   */
  @HostListener('pointerenter')
  protected onPointerEnter(): void {
    this.state().activeDescendantManager.activate(this);
  }

  /**
   * Whenever the pointer leaves the option, deactivate it.
   * @internal
   */
  @HostListener('pointerleave')
  protected onPointerLeave(): void {
    this.state().activeDescendantManager.activate(undefined);
  }
}
