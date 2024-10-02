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
      --pagination-button-color: rgb(10 10 10);
      --pagination-button-background-color: rgb(255 255 255);
      --pagination-button-background-color-hover: rgb(250 250 250);
      --pagination-button-pressed-background-color: rgb(245 245 245);
      --pagination-button-selected-background-color: rgb(10 10 10);
      --pagination-button-selected-color: rgb(255 255 255);
      --pagination-button-disabled-background-color: rgb(210 210 210);

      --pagination-button-color-dark: rgb(255 255 255);
      --pagination-button-background-color-dark: rgb(43 43 47);
      --pagination-button-background-color-hover-dark: rgb(63 63 70);
      --pagination-button-pressed-background-color-dark: rgb(39 39 42);
      --pagination-button-selected-background-color-dark: rgb(90, 90, 99);
      --pagination-button-selected-color-dark: rgb(255 255 255);
      --pagination-button-disabled-background-color: rgb(60, 60, 60);
    }

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
      color: light-dark(var(--pagination-button-color), var(--pagination-button-color-dark));
      outline: none;
      font-size: 14px;
      font-weight: 500;
      background-color: light-dark(
        var(--pagination-button-background-color),
        var(--pagination-button-background-color-dark)
      );
      box-shadow: 0 0 0 1px light-dark(rgba(0, 0, 0, 0.05), rgba(54, 54, 54, 0.7));
      cursor: pointer;
      transition: all 0.2s;

      &[data-hover]:not([data-disabled]):not([data-selected]) {
        background-color: light-dark(
          var(--pagination-button-background-color-hover),
          var(--pagination-button-background-color-hover-dark)
        );
      }

      &[data-focus-visible]:not([data-disabled]) {
        box-shadow:
          0 1px 3px 0 rgb(0 0 0 / 0.1),
          0 1px 2px -1px rgb(0 0 0 / 0.1),
          0 0 0 1px rgb(0 0 0 / 0.05),
          0 0 0 2px light-dark(#f5f5f5, #3f3f46),
          0 0 0 4px rgb(59 130 246);
      }

      &[data-press]:not([data-disabled]):not([data-selected]) {
        background-color: light-dark(
          var(--pagination-button-pressed-background-color),
          var(--pagination-button-pressed-background-color-dark)
        );
      }

      &[data-disabled] {
        color: rgb(210 210 210);
        background-color: light-dark(
          var(--pagination-button-disabled-background-color),
          var(--pagination-button-disabled-background-color-dark)
        );
        cursor: not-allowed;
      }

      &[data-selected] {
        background-color: light-dark(
          var(--pagination-button-selected-background-color),
          var(--pagination-button-selected-background-color-dark)
        );
        color: light-dark(
          var(--pagination-button-selected-color),
          var(--pagination-button-selected-color-dark)
        );
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
