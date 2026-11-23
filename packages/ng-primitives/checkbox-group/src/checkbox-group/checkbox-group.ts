import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { SetterOptions } from 'ng-primitives/state';
import { uniqueId } from 'ng-primitives/utils';
import { ngpCheckboxGroup, provideCheckboxGroupState } from './checkbox-group-state';

@Directive({
  selector: '[ngpCheckboxGroup]',
  exportAs: 'ngpCheckboxGroup',
  // Each group owns its selection state; descendant checkboxes inherit it.
  providers: [provideCheckboxGroupState({ inherit: false })],
})
export class NgpCheckboxGroup<T = string> {
  readonly id = input<string>(uniqueId('ngp-checkbox-group'));
  readonly value = input<T[] | undefined>(undefined, { alias: 'ngpCheckboxGroupValue' });
  readonly defaultValue = input<T[]>([], { alias: 'ngpCheckboxGroupDefaultValue' });
  readonly allValues = input<T[] | undefined>(undefined, { alias: 'ngpCheckboxGroupAllValues' });
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpCheckboxGroupDisabled',
    transform: booleanAttribute,
  });
  readonly compareWith = input<(a: T, b: T) => boolean>((a, b) => a === b, {
    alias: 'ngpCheckboxGroupCompareWith',
  });
  readonly valueChange = output<T[]>({ alias: 'ngpCheckboxGroupValueChange' });

  protected readonly state = ngpCheckboxGroup<T>({
    id: this.id,
    value: this.value,
    defaultValue: this.defaultValue,
    allValues: this.allValues,
    disabled: this.disabled,
    compareWith: this.compareWith,
    onValueChange: value => this.valueChange.emit(value),
  });

  select(value: T): void {
    this.state.select(value);
  }

  deselect(value: T): void {
    this.state.deselect(value);
  }

  toggle(value: T): void {
    this.state.toggle(value);
  }

  setValue(value: T[], options?: SetterOptions): void {
    this.state.setValue(value, options);
  }

  setDefaultValue(value: T[]): void {
    this.state.setDefaultValue(value);
  }

  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }
}
