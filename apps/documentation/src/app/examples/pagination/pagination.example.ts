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
  standalone: true,
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
  viewProviders: [
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
          <a ngpPaginationFirst aria-label="First Page">
            <ng-icon name="heroChevronDoubleLeft" />
          </a>
        </li>

        <li>
          <a ngpPaginationPrevious aria-label="Previous Page">
            <ng-icon name="heroChevronLeft" />
          </a>
        </li>

        <li>
          <a ngpPaginationButton ngpPaginationButtonPage="1" aria-label="Page 1">1</a>
        </li>
        <li>
          <a ngpPaginationButton ngpPaginationButtonPage="2" aria-label="Page 2">2</a>
        </li>
        <li>
          <a ngpPaginationButton ngpPaginationButtonPage="3" aria-label="Page 3">3</a>
        </li>
        <li>
          <a ngpPaginationButton ngpPaginationButtonPage="4" aria-label="Page 4">4</a>
        </li>
        <li>
          <a ngpPaginationButton ngpPaginationButtonPage="5" aria-label="Page 5">5</a>
        </li>

        <li>
          <a ngpPaginationNext aria-label="Next Page">
            <ng-icon name="heroChevronRight" />
          </a>
        </li>

        <li>
          <a ngpPaginationLast aria-label="Last Page">
            <ng-icon name="heroChevronDoubleRight" />
          </a>
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
      color: rgb(10 10 10);
      outline: none;
      font-size: 14px;
      font-weight: 500;
      background-color: #fff;
      box-shadow: 0 0 0 1px rgb(0 0 0 / 0.05);
      cursor: pointer;

      &[data-hover='true']:not([data-disabled='true']):not([data-selected='true']) {
        background-color: rgb(250 250 250);
      }

      &[data-focus-visible='true']:not([data-disabled='true']) {
        box-shadow:
          0 1px 3px 0 rgb(0 0 0 / 0.1),
          0 1px 2px -1px rgb(0 0 0 / 0.1),
          0 0 0 1px rgb(0 0 0 / 0.05),
          0 0 0 2px #f5f5f5,
          0 0 0 4px rgb(59 130 246);
      }

      &[data-press='true']:not([data-disabled='true']):not([data-selected='true']) {
        background-color: rgb(245 245 245);
      }

      &[data-disabled='true'] {
        color: rgb(210 210 210);
        cursor: not-allowed;
      }

      &[data-selected='true'] {
        background-color: rgb(10 10 10);
        color: white;
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
