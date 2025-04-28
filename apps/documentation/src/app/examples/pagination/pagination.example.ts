import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronDoubleLeft,
  heroChevronDoubleRight,
  heroChevronLeft,
  heroChevronRight,
} from '@ng-icons/heroicons/outline';
import {
  NgpPagination,
  NgpPaginationButton,
  NgpPaginationFirst,
  NgpPaginationLast,
  NgpPaginationNext,
  NgpPaginationPrevious,
} from 'ng-primitives/pagination';

@Component({
  selector: 'app-pagination',
  imports: [
    NgIcon,
    NgpPagination,
    NgpPaginationButton,
    NgpPaginationFirst,
    NgpPaginationNext,
    NgpPaginationPrevious,
    NgpPaginationLast,
  ],
  providers: [
    provideIcons({
      heroChevronDoubleLeft,
      heroChevronDoubleRight,
      heroChevronLeft,
      heroChevronRight,
    }),
  ],
  template: `
    <nav
      [(ngpPaginationPage)]="page"
      ngpPagination
      ngpPaginationPageCount="5"
      aria-label="Pagination Navigation"
    >
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

        <li>
          <button ngpPaginationButton ngpPaginationButtonPage="1" aria-label="Page 1">1</button>
        </li>
        <li>
          <button ngpPaginationButton ngpPaginationButtonPage="2" aria-label="Page 2">2</button>
        </li>
        <li>
          <button ngpPaginationButton ngpPaginationButtonPage="3" aria-label="Page 3">3</button>
        </li>
        <li>
          <button ngpPaginationButton ngpPaginationButtonPage="4" aria-label="Page 4">4</button>
        </li>
        <li>
          <button ngpPaginationButton ngpPaginationButtonPage="5" aria-label="Page 5">5</button>
        </li>

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
    </nav>
  `,
  styles: `
    :host {
      display: contents;
    }

    ul {
      display: flex;
      align-items: center;
      column-gap: 0.5rem;
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
})
export default class PaginationExample {
  /**
   * The currently selected page.
   */
  readonly page = signal<number>(1);
}
