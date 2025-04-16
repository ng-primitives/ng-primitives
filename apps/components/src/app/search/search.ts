import { Component, input, model } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass } from '@ng-icons/heroicons/outline';
import { NgpButton } from 'ng-primitives/button';
import { NgpInput } from 'ng-primitives/input';
import { NgpSearch, NgpSearchClear } from 'ng-primitives/search';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

@Component({
  selector: 'app-search',
  hostDirectives: [NgpSearch],
  imports: [NgIcon, NgpSearchClear, NgpInput, NgpButton],
  providers: [provideValueAccessor(Search), provideIcons({ heroMagnifyingGlass })],
  template: `
    <ng-icon name="heroMagnifyingGlass" />
    <input
      [value]="query()"
      [placeholder]="placeholder()"
      (input)="onQueryChange($event)"
      ngpInput
      type="search"
    />
    <button ngpSearchClear ngpButton aria-label="Clear search">Clear</button>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
    }

    [ngpInput] {
      height: 36px;
      width: 100%;
      border-radius: 8px;
      padding: 0 16px 0 40px;
      border: none;
      background: var(--ngp-background);
      box-shadow: var(--ngp-input-shadow);
      outline: none;
    }

    /* clears the 'X' from Chrome */
    [ngpInput]::-webkit-search-decoration,
    [ngpInput]::-webkit-search-cancel-button,
    [ngpInput]::-webkit-search-results-button,
    [ngpInput]::-webkit-search-results-decoration {
      display: none;
    }

    [ngpInput][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 0px;
    }

    [ngpInput]::placeholder {
      color: var(--ngp-text-placeholder);
    }

    [ngpButton] {
      position: absolute;
      top: 0;
      right: 0;
      height: 36px;
      padding: 0 16px;
      border: none;
      border-radius: 0 8px 8px 0;
      background-color: transparent;
      color: var(--ngp-text-blue);
      font-size: 0.875rem;
      line-height: 1.25rem;
      cursor: pointer;
      outline: none;
      display: none;
    }

    [ngpButton]:not([data-empty]) {
      display: block;
    }

    ng-icon {
      position: absolute;
      font-size: 1.25rem;
      top: 18px;
      left: 12px;
      transform: translateY(-50%);
      color: var(--ngp-text-tertiary);
    }
  `,
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class Search implements ControlValueAccessor {
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
