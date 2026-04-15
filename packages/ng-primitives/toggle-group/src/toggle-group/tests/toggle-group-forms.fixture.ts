import { Component } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
  injectToggleGroupState,
  NgpToggleGroup,
  NgpToggleGroupItem,
} from 'ng-primitives/toggle-group';
import {
  ChangeFn,
  provideValueAccessor,
  safeTakeUntilDestroyed,
  TouchedFn,
} from 'ng-primitives/utils';

/**
 * Inline fixture mirroring `apps/components/.../reusable-components/toggle-group/toggle-group.ts`.
 * Used by the reusable-component test suites.
 */
@Component({
  selector: 'app-toggle-group',
  hostDirectives: [
    {
      directive: NgpToggleGroup,
      inputs: [
        'ngpToggleGroupOrientation:orientation',
        'ngpToggleGroupType:type',
        'ngpToggleGroupValue:value',
        'ngpToggleGroupDisabled:disabled',
      ],
      outputs: ['ngpToggleGroupValueChange:valueChange'],
    },
  ],
  template: `<ng-content />`,
  providers: [provideValueAccessor(ToggleGroup)],
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class ToggleGroup implements ControlValueAccessor {
  private readonly toggleGroup = injectToggleGroupState();
  private onChange?: ChangeFn<string[]>;
  protected onTouched?: TouchedFn;

  constructor() {
    this.toggleGroup()
      .valueChange.pipe(safeTakeUntilDestroyed())
      .subscribe(value => this.onChange?.(value));
  }

  writeValue(value: string[]): void {
    this.toggleGroup().setValue(value, { emit: false });
  }

  registerOnChange(fn: ChangeFn<string[]>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.toggleGroup().setDisabled(isDisabled);
  }
}

@Component({
  selector: 'button[app-toggle-group-item]',
  hostDirectives: [
    {
      directive: NgpToggleGroupItem,
      inputs: ['ngpToggleGroupItemValue:value', 'ngpToggleGroupItemDisabled:disabled'],
    },
  ],
  template: `<ng-content />`,
})
export class ToggleGroupItemFixture {}
