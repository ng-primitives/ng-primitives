import { Component, input, model } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgpButton } from 'ng-primitives/button';
import { NgpInput } from 'ng-primitives/input';
import { NgpSearch, NgpSearchClear } from 'ng-primitives/search';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

/**
 * Inline fixture mirroring
 * `apps/components/.../reusable-components/search/search.ts`.
 * Used by the reusable-component test suites. The decorative `ng-icon` glyph
 * from the real component is omitted as it plays no behavioural role.
 */
@Component({
  selector: 'app-search',
  hostDirectives: [NgpSearch],
  imports: [NgpSearchClear, NgpInput, NgpButton],
  providers: [provideValueAccessor(SearchFixture)],
  template: `
    <input
      [value]="query()"
      [placeholder]="placeholder()"
      (input)="onQueryChange($event)"
      ngpInput
      type="search"
    />
    <button ngpSearchClear ngpButton aria-label="Clear search">Clear</button>
  `,
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class SearchFixture implements ControlValueAccessor {
  /** The search query */
  readonly query = model<string>('');

  /** The placeholder text */
  readonly placeholder = input<string>('');

  /** The function to call when the value changes */
  private onChange?: ChangeFn<string>;

  /** The function to call when the control is touched */
  protected onTouched?: TouchedFn;

  writeValue(value: string): void {
    this.query.set(value);
  }

  registerOnChange(fn: ChangeFn<string>): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  protected onQueryChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.query.set(input.value);
    this.onChange?.(input.value);
  }
}
