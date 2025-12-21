import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import type { Placement } from '@floating-ui/dom';
import { uniqueId } from 'ng-primitives/utils';
import { injectSelectConfig } from '../config/select-config';
import { ngpSelect, provideSelectState } from './select-state';

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
})
export class NgpSelect {
  /** Access the select configuration. */
  protected readonly config = injectSelectConfig();

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

  /** The state of the select. */
  protected readonly state = ngpSelect({
    id: this.id,
    value: this.value,
    multiple: this.multiple,
    disabled: this.disabled,
    compareWith: this.compareWith,
    placement: this.placement,
    container: this.container,
    onValueChange: value => this.valueChange.emit(value),
    onOpenChange: open => this.openChange.emit(open),
  });
}
