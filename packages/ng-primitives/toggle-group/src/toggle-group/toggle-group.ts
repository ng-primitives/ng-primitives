import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { injectToggleGroupConfig } from '../config/toggle-group-config';
import { ngpToggleGroupPattern, provideToggleGroupPattern } from './toggle-group-pattern';

@Directive({
  selector: '[ngpToggleGroup]',
  exportAs: 'ngpToggleGroup',
  providers: [provideToggleGroupPattern(NgpToggleGroup, instance => instance.pattern)],
})
export class NgpToggleGroup {
  /**
   * Access the global toggle group configuration.
   */
  private readonly config = injectToggleGroupConfig();

  /**
   * The orientation of the toggle group.
   */
  readonly orientation = input<NgpOrientation>(this.config.orientation, {
    alias: 'ngpToggleGroupOrientation',
  });

  /**
   * Whether toggle buttons can be deselected. If set to `false`, clicking a selected toggle button will not deselect it.
   * @default true
   */
  readonly allowDeselection = input<boolean, BooleanInput>(this.config.allowDeselection, {
    alias: 'ngpToggleGroupAllowDeselection',
    transform: booleanAttribute,
  });

  /**
   * The type of the toggle group, whether only one item can be selected or multiple.
   */
  readonly type = input<'single' | 'multiple'>(this.config.type, { alias: 'ngpToggleGroupType' });

  /**
   * The selected value(s) of the toggle group.
   */
  readonly value = input<string[]>([], { alias: 'ngpToggleGroupValue' });

  /**
   * Emits when the value of the toggle group changes.
   */
  readonly valueChange = output<string[]>({ alias: 'ngpToggleGroupValueChange' });

  /**
   * Whether the toggle group is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleGroupDisabled',
    transform: booleanAttribute,
  });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpToggleGroupPattern({
    orientation: this.orientation,
    allowDeselection: this.allowDeselection,
    type: this.type,
    value: this.value,
    disabled: this.disabled,
    onValueChange: (value: string[]) => this.valueChange.emit(value),
  });

  /**
   * Check if a value is selected in the toggle group.
   * @internal
   */
  isSelected(value: string): boolean {
    return this.pattern.isSelected(value);
  }

  /**
   * Toggle a value in the toggle group.
   * @internal
   */
  toggle(value: string): void {
    this.pattern.toggle(value);
  }
}
