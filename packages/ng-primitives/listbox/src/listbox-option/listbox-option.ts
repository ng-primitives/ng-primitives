import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, OnDestroy } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpListboxOption } from './listbox-option-state';

@Directive({
  selector: '[ngpListboxOption]',
  exportAs: 'ngpListboxOption',
})
export class NgpListboxOption<T> implements OnDestroy {
  /**
   * The id of the listbox.
   */
  readonly id = input(uniqueId('ngp-listbox-option'));

  /**
   * The value of the option.
   */
  readonly value = input.required<T>({
    alias: 'ngpListboxOptionValue',
  });

  /**
   * Whether the option is disabled.
   */
  readonly optionDisabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpListboxOptionDisabled',
    transform: booleanAttribute,
  });

  protected readonly state = ngpListboxOption<T>({
    id: this.id,
    value: this.value,
    optionDisabled: this.optionDisabled,
  });

  /**
   * @internal
   * Whether the option is disabled - this is used by the `Highlightable` interface.
   */
  get disabled(): boolean {
    return this.state._disabled();
  }

  ngOnDestroy(): void {
    return this.state.destroy();
  }

  /**
   * @internal
   * Sets the active state of the option.
   */
  setActiveStyles(): void {
    return this.state.setActiveStyles();
  }

  /**
   * @internal
   * Sets the inactive state of the option.
   */
  setInactiveStyles(): void {
    return this.state.setInactiveStyles();
  }

  /**
   * @internal
   * Gets the label of the option, used by the `Highlightable` interface.
   */
  getLabel(): string {
    return this.state.getLabel();
  }

  /**
   * @internal
   * Selects the option.
   */
  select(origin: FocusOrigin): void {
    return this.state.select(origin);
  }

  /**
   * @internal
   * Activate the current options.
   */
  activate(): void {
    return this.state.activate();
  }
}
