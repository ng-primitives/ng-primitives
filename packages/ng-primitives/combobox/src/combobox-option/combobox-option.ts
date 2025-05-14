import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input, OnDestroy, OnInit } from '@angular/core';
import { injectElementRef, setupInteractions } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectComboboxState } from '../combobox/combobox-state';

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
  },
})
export class NgpComboboxOption<T> implements OnInit, OnDestroy {
  /** Access the combobox state. */
  protected readonly state = injectComboboxState<T | T[]>();

  /**
   * The element reference of the option.
   * @internal
   */
  readonly elementRef = injectElementRef();

  /** The id of the option. */
  readonly id = input<string>(uniqueId('ngp-combobox-option'));

  /** The value of the option. */
  readonly value = input<T>(undefined, {
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

    if (!value) {
      return false;
    }

    if (this.state().multiple()) {
      return (
        Array.isArray(value) && value.some(v => this.state().compareWith()(v, this.state().value()))
      );
    }

    return this.state().compareWith()(value, this.state().value());
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
}
