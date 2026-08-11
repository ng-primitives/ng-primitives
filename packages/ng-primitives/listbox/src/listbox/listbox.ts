import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpSelectionMode } from 'ng-primitives/common';
import { uniqueId } from 'ng-primitives/utils';
import { ngpListbox, provideListboxState } from './listbox-state';

@Directive({
  selector: '[ngpListbox]',
  exportAs: 'ngpListbox',
  providers: [provideListboxState()],
})
export class NgpListbox<T> {
  /**
   * The id of the listbox.
   */
  readonly id = input(uniqueId('ngp-listbox'));

  /**
   * The listbox selection mode.
   */
  readonly mode = input<NgpSelectionMode>('single', {
    alias: 'ngpListboxMode',
  });

  /**
   * The listbox selection. When defined the listbox is controlled.
   */
  readonly value = input<T[] | undefined>(undefined, {
    alias: 'ngpListboxValue',
  });

  /**
   * The default listbox selection for uncontrolled usage.
   */
  readonly defaultValue = input<T[]>([], {
    alias: 'ngpListboxDefaultValue',
  });

  /**
   * Emits when the listbox selection changes.
   */
  readonly valueChange = output<T[]>({
    alias: 'ngpListboxValueChange',
  });

  /**
   * The listbox disabled state.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpListboxDisabled',
    transform: booleanAttribute,
  });

  /**
   * The comparator function to use when comparing values.
   * If not provided, strict equality (===) is used.
   */
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b, {
    alias: 'ngpListboxCompareWith',
  });

  constructor() {
    ngpListbox({
      id: this.id,
      mode: this.mode,
      value: this.value,
      defaultValue: this.defaultValue,
      disabled: this.disabled,
      compareWith: this.compareWith,
      onValueChange: (value: T[]) => this.valueChange.emit(value),
    });
  }
}
