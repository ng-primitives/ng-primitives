import { FocusOrigin } from '@angular/cdk/a11y';
import { BooleanInput } from '@angular/cdk/coercion';
import { AfterContentInit, booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpSelectionMode } from 'ng-primitives/common';
import { uniqueId } from 'ng-primitives/utils';
import { NgpListboxOptionState } from '../listbox-option/listbox-option-state';
import { ngpListbox, provideListboxState } from './listbox-state';

@Directive({
  selector: '[ngpListbox]',
  exportAs: 'ngpListbox',
  providers: [provideListboxState()],
})
export class NgpListbox<T> implements AfterContentInit {
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
   * The listbox selection.
   */
  readonly value = input<T[]>([], {
    alias: 'ngpListboxValue',
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

  /**
   * The listbox state
   */
  protected readonly state = ngpListbox({
    id: this.id,
    mode: this.mode,
    value: this.value,
    disabled: this.disabled,
    compareWith: this.compareWith,
    onValueChange: (value: T[]) => this.valueChange.emit(value),
  });

  ngAfterContentInit(): void {
    return this.state.onAfterContentInit();
  }

  /**
   * @internal
   * Selects an option in the listbox.
   */
  selectOption(value: T, origin: FocusOrigin): void {
    return this.state.selectOption(value, origin);
  }

  /**
   * @internal
   * Determine if an option is selected using the compareWith function.
   */
  isSelected(value: T): boolean {
    return this.state.isSelected(value);
  }

  /**
   * @internal
   * Activate an option in the listbox.
   */
  activateOption(value: T) {
    return this.state.activateOption(value);
  }

  /**
   * Registers an option with the listbox.
   * @internal
   */
  addOption(option: NgpListboxOptionState<T>): void {
    return this.addOption(option);
  }

  /**
   * Deregisters an option with the listbox.
   * @internal
   */
  removeOption(option: NgpListboxOptionState<T>): void {
    return this.state.removeOption(option);
  }
}
