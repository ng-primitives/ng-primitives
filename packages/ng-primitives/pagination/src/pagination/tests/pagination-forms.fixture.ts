import { Component, computed } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import {
  injectPaginationState,
  NgpPagination,
  NgpPaginationButton,
  NgpPaginationFirst,
  NgpPaginationLast,
  NgpPaginationNext,
  NgpPaginationPrevious,
} from 'ng-primitives/pagination';
import { ChangeFn, provideValueAccessor, TouchedFn } from 'ng-primitives/utils';

/**
 * Inline fixture mirroring
 * `apps/components/.../reusable-components/pagination/pagination.ts`. Used by the
 * reusable-component test suites. The control value is the current page number.
 */
@Component({
  selector: 'app-pagination',
  hostDirectives: [
    {
      directive: NgpPagination,
      inputs: [
        'ngpPaginationPage:page',
        'ngpPaginationPageCount:pageCount',
        'ngpPaginationDisabled:disabled',
      ],
      outputs: ['ngpPaginationPageChange:pageChange'],
    },
  ],
  imports: [
    NgpPaginationButton,
    NgpPaginationFirst,
    NgpPaginationLast,
    NgpPaginationNext,
    NgpPaginationPrevious,
  ],
  providers: [provideValueAccessor(Pagination)],
  template: `
    <button ngpPaginationFirst aria-label="First Page">First</button>
    <button ngpPaginationPrevious aria-label="Previous Page">Previous</button>

    @for (page of pages(); track page) {
      <button
        [ngpPaginationButtonPage]="page"
        [attr.aria-label]="'Page ' + page"
        ngpPaginationButton
      >
        {{ page }}
      </button>
    }

    <button ngpPaginationNext aria-label="Next Page">Next</button>
    <button ngpPaginationLast aria-label="Last Page">Last</button>
  `,
  host: {
    '(focusout)': 'onTouched?.()',
  },
})
export class Pagination implements ControlValueAccessor {
  /** Access the pagination state */
  protected readonly state = injectPaginationState();

  /** Get the pages as an array we can iterate over */
  protected readonly pages = computed(() =>
    Array.from({ length: this.state().pageCount() }).map((_, i) => i + 1),
  );

  /** The onChange callback */
  private onChange?: ChangeFn<number>;

  /** The onTouched callback */
  protected onTouched?: TouchedFn;

  constructor() {
    this.state().pageChange.subscribe(value => this.onChange?.(value));
  }

  /** Write a new value to the control */
  writeValue(value: number | null): void {
    // Angular writes null on reset and before the initial value lands; page is always
    // a number, so fall back to the first page rather than passing null through.
    // writing a value from the model must not re-emit through onChange
    this.state().setPage(value ?? 1, { emit: false });
  }

  /** Register a callback to be called when the value changes */
  registerOnChange(fn: ChangeFn<number>): void {
    this.onChange = fn;
  }

  /** Register a callback to be called when the control is touched */
  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }

  /** Reflect the form control's disabled state onto the pagination */
  setDisabledState(isDisabled: boolean): void {
    this.state().setDisabled(isDisabled);
  }
}
