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
import { injectElementRef, setupInteractions } from 'ng-primitives/internal';
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
export class NgpSelectOption implements OnInit, OnDestroy, NgpActivatable {
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

  /**
   * Whether this option is the active descendant.
   * @internal
   */
  protected readonly active = computed(
    () => this.state().activeDescendantManager.activeDescendant() === this.id(),
  );

  /** Whether this option is selected. */
  protected readonly selected = computed(() => this.state().isOptionSelected(this));

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

    this.state().toggleOption(this);
  }

  // Note: The displayed trigger text is resolved by the Select using the
  // option's DOM textContent. No separate view value input is needed here.

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
