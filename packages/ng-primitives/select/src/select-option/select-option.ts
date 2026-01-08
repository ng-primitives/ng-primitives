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
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef, scrollIntoViewIfNeeded } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectState } from '../select/select-state';

@Directive({
  selector: '[ngpSelectOption]',
  exportAs: 'ngpSelectOption',
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
export class NgpSelectOption implements OnInit, OnDestroy {
  /** Access the select state. */
  protected readonly state = injectSelectState();

  /**
   * The element reference of the option.
   * @internal
   */
  readonly elementRef = injectElementRef();

  /** The id of the option. */
  readonly id = input<string>(uniqueId('ngp-select-option'));

  /** @required The value of the option. */
  readonly value = input<any>(undefined, {
    alias: 'ngpSelectOptionValue',
  });

  /** The disabled state of the option. */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSelectOptionDisabled',
    transform: booleanAttribute,
  });

  /** The index of the option in the list. */
  readonly index = input<number | undefined>(undefined, {
    alias: 'ngpSelectOptionIndex',
  });

  /**
   * Whether this option is the active descendant.
   * @internal
   */
  protected readonly active = computed(() => {
    // if the option has an index, use that to determine if it's active because this
    // is required for virtual scrolling scenarios
    const index = this.index();

    if (index !== undefined) {
      return this.state().activeDescendantManager.index() === index;
    }

    return this.state().activeDescendantManager.id() === this.id();
  });

  /** Whether this option is selected. */
  protected readonly selected = computed(() => {
    const value = this.value();

    if (!value) {
      return false;
    }

    if (this.state().multiple()) {
      const selectValue = this.state().value();
      return (
        Array.isArray(selectValue) && selectValue.some(v => this.state().compareWith()(value, v))
      );
    }

    return this.state().compareWith()(value, this.state().value());
  });

  constructor() {
    this.state().registerOption(this);

    ngpInteractions({
      hover: true,
      press: true,
      disabled: this.disabled,
    });
  }

  ngOnInit(): void {
    if (this.value() === undefined) {
      throw new Error(
        'ngpSelectOption: The value input is required. Please provide a value for the option.',
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

    this.state().toggleOption(this.id());
  }

  /**
   * Scroll the option into view.
   * @internal
   */
  scrollIntoView(): void {
    scrollIntoViewIfNeeded(this.elementRef.nativeElement);
  }

  /**
   * Whenever the pointer enters the option, activate it.
   * @internal
   */
  @HostListener('pointerenter')
  protected onPointerEnter(): void {
    this.state().activeDescendantManager.activateById(this.id(), { scroll: false });
  }

  /**
   * Whenever the pointer leaves the option, deactivate it.
   * @internal
   */
  @HostListener('pointerleave')
  protected onPointerLeave(): void {
    this.state().activeDescendantManager.reset();
  }
}
