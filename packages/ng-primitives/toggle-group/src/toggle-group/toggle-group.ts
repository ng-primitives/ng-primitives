import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { NgpOrientation } from 'ng-primitives/common';
import { syncState } from 'ng-primitives/internal';
import { injectRovingFocusGroupState, NgpRovingFocusGroup } from 'ng-primitives/roving-focus';
import { injectToggleGroupConfig } from '../config/toggle-group-config';
import { provideToggleGroupState, toggleGroupState } from './toggle-group-state';

@Directive({
  selector: '[ngpToggleGroup]',
  exportAs: 'ngpToggleGroup',
  providers: [provideToggleGroupState()],
  hostDirectives: [NgpRovingFocusGroup],
  host: {
    role: 'group',
    '[attr.data-orientation]': 'state.orientation()',
    '[attr.data-type]': 'state.type()',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
})
export class NgpToggleGroup {
  /**
   * Access the roving focus group state.
   */
  private readonly rovingFocusGroupState = injectRovingFocusGroupState();

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
   * The state of the toggle group.
   */
  protected readonly state = toggleGroupState<NgpToggleGroup>(this);

  constructor() {
    // the roving focus group defaults to vertical orientation whereas
    // the default for the toggle group may be different if provided via global config
    syncState(this.state.orientation, this.rovingFocusGroupState().orientation);
  }

  /**
   * Select a value in the toggle group.
   */
  private select(value: string): void {
    if (this.state.disabled()) {
      return;
    }

    let newValue: string[] = [];

    if (this.state.type() === 'single') {
      newValue = [value];
    } else {
      newValue = [...this.state.value(), value];
    }

    this.state.value.set(newValue);
    this.valueChange.emit(newValue);
  }

  /**
   * De-select a value in the toggle group.
   */
  private deselect(value: string): void {
    if (this.state.disabled() || !this.state.allowDeselection()) {
      return;
    }

    const newValue = this.state.value().filter(v => v !== value);
    this.state.value.set(newValue);
    this.valueChange.emit(newValue);
  }

  /**
   * Check if a value is selected in the toggle group.
   * @internal
   */
  isSelected(value: string): boolean {
    return this.state.value()?.includes(value) ?? false;
  }

  /**
   * Toggle a value in the toggle group.
   * @internal
   */
  toggle(value: string): void {
    if (this.isSelected(value)) {
      this.deselect(value);
    } else {
      this.select(value);
    }
  }
}
