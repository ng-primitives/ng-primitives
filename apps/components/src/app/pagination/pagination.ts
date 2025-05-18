import { Component, computed } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronDoubleLeft,
  heroChevronDoubleRight,
  heroChevronLeft,
  heroChevronRight,
} from '@ng-icons/heroicons/outline';
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
    NgIcon,
  ],
  providers: [
    provideValueAccessor(NgpPagination),
    provideIcons({
      heroChevronDoubleLeft,
      heroChevronDoubleRight,
      heroChevronLeft,
      heroChevronRight,
    }),
  ],
  template: `
    <ul>
      <li>
        <button ngpPaginationFirst aria-label="First Page">
          <ng-icon name="heroChevronDoubleLeft" />
        </button>
      </li>

      <li>
        <button ngpPaginationPrevious aria-label="Previous Page">
          <ng-icon name="heroChevronLeft" />
        </button>
      </li>

      @for (page of pages(); track page) {
        <li>
          <button
            [ngpPaginationButtonPage]="page"
            [attr.aria-label]="'Page ' + page"
            ngpPaginationButton
          >
            {{ page }}
          </button>
        </li>
      }

      <li>
        <button ngpPaginationNext aria-label="Next Page">
          <ng-icon name="heroChevronRight" />
        </button>
      </li>

      <li>
        <button ngpPaginationLast aria-label="Last Page">
          <ng-icon name="heroChevronDoubleRight" />
        </button>
      </li>
    </ul>
  `,
  styles: `
    ul {
      display: flex;
      align-items: center;
      column-gap: 0.5rem;
      list-style: none;
    }

    [ngpPaginationFirst],
    [ngpPaginationPrevious],
    [ngpPaginationButton],
    [ngpPaginationNext],
    [ngpPaginationLast] {
      all: unset;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 2rem;
      height: 2rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      outline: none;
      font-size: 14px;
      font-weight: 500;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-button-shadow);
      cursor: pointer;
      transition: background-color 0.2s;

      &[data-hover]:not([data-disabled]):not([data-selected]) {
        background-color: var(--ngp-background-hover);
      }

      &[data-focus-visible]:not([data-disabled]) {
        outline: 2px solid var(--ngp-focus-ring);
      }

      &[data-press]:not([data-disabled]):not([data-selected]) {
        background-color: var(--ngp-background-active);
      }

      &[data-disabled] {
        color: rgb(210 210 210);
        background-color: var(--ngp-background-disabled);
        cursor: not-allowed;
        box-shadow: none;
      }

      &[data-selected] {
        background-color: var(--ngp-background-inverse);
        color: var(--ngp-text-inverse);
      }
    }
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
  writeValue(value: number): void {
    this.state().page.set(value);
  }

  /** Register a callback to be called when the value changes */
  registerOnChange(fn: ChangeFn<number>): void {
    this.onChange = fn;
  }

  /** Register a callback to be called when the control is touched */
  registerOnTouched(fn: TouchedFn): void {
    this.onTouched = fn;
  }
}
