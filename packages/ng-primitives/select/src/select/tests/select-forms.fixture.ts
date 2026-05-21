import { Component, input } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
  injectSelectState,
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';
import {
  ChangeFn,
  provideValueAccessor,
  safeTakeUntilDestroyed,
  TouchedFn,
} from 'ng-primitives/utils';

/**
 * Inline fixture mirroring `apps/components/.../reusable-components/select/select.ts`.
 * Used by the reusable-component test suites so the consumer-facing wrapper is
 * exercised independently of the apps workspace.
 */
@Component({
  selector: 'app-select',
  hostDirectives: [
    {
      directive: NgpSelect,
      inputs: [
        'ngpSelectValue:value',
        'ngpSelectMultiple:multiple',
        'ngpSelectDisabled:disabled',
      ],
      outputs: ['ngpSelectValueChange:valueChange'],
    },
  ],
  providers: [provideValueAccessor(SelectFixture)],
  imports: [NgpSelectDropdown, NgpSelectOption, NgpSelectPortal],
  template: `
    @if (state().value(); as value) {
      <span data-testid="select-value">{{ formatValue(value) }}</span>
    } @else {
      <span data-testid="select-placeholder">{{ placeholder() }}</span>
    }

    <div *ngpSelectPortal ngpSelectDropdown data-testid="select-dropdown">
      @for (option of options(); track option) {
        <div
          [ngpSelectOptionValue]="option"
          [attr.data-testid]="'option-' + option"
          ngpSelectOption
        >
          {{ option }}
        </div>
      } @empty {
        <div data-testid="select-empty">No options found</div>
      }
    </div>
  `,
  host: {
    'data-testid': 'select',
    '(focusout)': 'onTouched?.()',
  },
})
export class SelectFixture implements ControlValueAccessor {
  /** Access the underlying select primitive state. */
  // We cast to a string-or-array union to support both single and multi-select tests.
  protected readonly state = injectSelectState<string | string[]>();

  /** The options for the select. */
  readonly options = input<string[]>([]);

  /** Placeholder shown when no value is selected. */
  readonly placeholder = input<string>('Select…');

  /** Form change callback. */
  private onChange?: ChangeFn<string | string[] | undefined>;

  /** Form touched callback. */
  protected onTouched?: TouchedFn;

  constructor() {
    this.state()
      .valueChange.pipe(safeTakeUntilDestroyed())
      .subscribe(value => this.onChange?.(value));
  }

  writeValue(value: string | string[] | undefined): void {
    // Pass { emit: false } so writeValue doesn't bounce back through onChange.
    this.state().setValue(value, { emit: false });
  }

  registerOnChange(fn: ChangeFn<string | string[] | undefined>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.state().setDisabled(isDisabled);
  }

  protected formatValue(value: string | string[]): string {
    return Array.isArray(value) ? value.join(', ') : value;
  }
}
