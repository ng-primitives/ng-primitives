import { BooleanInput } from '@angular/cdk/coercion';
import {
  booleanAttribute,
  computed,
  Directive,
  HostListener,
  input,
  OnDestroy,
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
export class NgpSelectOption implements OnDestroy {
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
    const stateValue = this.state().value();

    // Only treat `undefined` as "no value" (allow '', 0, false).
    if (value === undefined) {
      return false;
    }

    if (this.state().multiple()) {
      return (
        Array.isArray(stateValue) && stateValue.some(v => this.state().compareWith()(value, v))
      );
    }

    // Only treat `undefined` as "no selection" (allow '', 0, false).
    if (stateValue === undefined) {
      return false;
    }

    return this.state().compareWith()(value, stateValue);
  });

  constructor() {
    this.state().registerOption(this);

    ngpInteractions({
      hover: true,
      press: true,
      disabled: this.disabled,
    });
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
    // if we have a known index, use that to activate the option because this
    // is required for virtual scrolling scenarios
    const index = this.index();

    if (index !== undefined) {
      this.state().activeDescendantManager.activateByIndex(index, {
        scroll: false,
        origin: 'pointer',
      });
      return;
    }

    // otherwise, activate by id
    this.state().activeDescendantManager.activateById(this.id(), {
      scroll: false,
      origin: 'pointer',
    });
  }

  /**
   * Whenever the pointer leaves the option, deactivate it.
   * @internal
   */
  @HostListener('pointerleave')
  protected onPointerLeave(): void {
    if (this.state().activeDescendantManager.id() === this.id()) {
      this.state().activeDescendantManager.reset({ origin: 'pointer' });
    }
  }
}
