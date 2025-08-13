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
      <ul class="flex items-center gap-2">
        <li>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-white text-[14px] font-medium text-gray-900 shadow outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none data-[selected]:bg-gray-900 data-[selected]:text-white dark:border dark:border-zinc-700 dark:bg-transparent dark:text-gray-100 dark:shadow dark:ring-1 dark:ring-white/10 dark:hover:bg-gray-900 dark:active:bg-gray-800 dark:disabled:border-none dark:disabled:bg-zinc-900 dark:disabled:text-gray-300 dark:data-[selected]:border-none dark:data-[selected]:bg-gray-100 dark:data-[selected]:text-gray-900"
            ngpPaginationFirst
            aria-label="First Page"
          >
            <ng-icon name="heroChevronDoubleLeft" />
          </button>
        </li>
        <li>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-white text-[14px] font-medium text-gray-900 shadow outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none data-[selected]:bg-gray-900 data-[selected]:text-white dark:border dark:border-zinc-700 dark:bg-transparent dark:text-gray-100 dark:shadow dark:ring-1 dark:ring-white/10 dark:hover:bg-gray-900 dark:active:bg-gray-800 dark:disabled:border-none dark:disabled:bg-zinc-900 dark:disabled:text-gray-300 dark:data-[selected]:border-none dark:data-[selected]:bg-gray-100 dark:data-[selected]:text-gray-900"
            ngpPaginationPrevious
            aria-label="Previous Page"
          >
            <ng-icon name="heroChevronLeft" />
          </button>
        </li>
        <li>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-white text-[14px] font-medium text-gray-900 shadow outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-300 disabled:shadow-none data-[selected]:bg-gray-900 data-[selected]:text-white dark:border dark:border-zinc-700 dark:bg-transparent dark:text-gray-100 dark:shadow dark:ring-1 dark:ring-white/10 dark:hover:bg-gray-900 dark:active:bg-gray-800 dark:disabled:border-none dark:disabled:bg-zinc-900 dark:disabled:text-gray-700 dark:data-[selected]:border-none dark:data-[selected]:bg-gray-100 dark:data-[selected]:text-gray-900"
            ngpPaginationButton
            ngpPaginationButtonPage="1"
            aria-label="Page 1"
          >
            1
          </button>
        </li>
        <li>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-white text-[14px] font-medium text-gray-900 shadow outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-300 disabled:shadow-none data-[selected]:bg-gray-900 data-[selected]:text-white dark:border dark:border-zinc-700 dark:bg-transparent dark:text-gray-100 dark:shadow dark:ring-1 dark:ring-white/10 dark:hover:bg-gray-900 dark:active:bg-gray-800 dark:disabled:border-none dark:disabled:bg-zinc-900 dark:disabled:text-gray-700 dark:data-[selected]:border-none dark:data-[selected]:bg-gray-100 dark:data-[selected]:text-gray-900"
            ngpPaginationButton
            ngpPaginationButtonPage="2"
            aria-label="Page 2"
          >
            2
          </button>
        </li>
        <li>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-white text-[14px] font-medium text-gray-900 shadow outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-300 disabled:shadow-none data-[selected]:bg-gray-900 data-[selected]:text-white dark:border dark:border-zinc-700 dark:bg-transparent dark:text-gray-100 dark:shadow dark:ring-1 dark:ring-white/10 dark:hover:bg-gray-900 dark:active:bg-gray-800 dark:disabled:border-none dark:disabled:bg-zinc-900 dark:disabled:text-gray-700 dark:data-[selected]:border-none dark:data-[selected]:bg-gray-100 dark:data-[selected]:text-gray-900"
            ngpPaginationButton
            ngpPaginationButtonPage="3"
            aria-label="Page 3"
          >
            3
          </button>
        </li>
        <li>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-white text-[14px] font-medium text-gray-900 shadow outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-300 disabled:shadow-none data-[selected]:bg-gray-900 data-[selected]:text-white dark:border dark:border-zinc-700 dark:bg-transparent dark:text-gray-100 dark:shadow dark:ring-1 dark:ring-white/10 dark:hover:bg-gray-900 dark:active:bg-gray-800 dark:disabled:border-none dark:disabled:bg-zinc-900 dark:disabled:text-gray-700 dark:data-[selected]:border-none dark:data-[selected]:bg-gray-100 dark:data-[selected]:text-gray-900"
            ngpPaginationButton
            ngpPaginationButtonPage="4"
            aria-label="Page 4"
          >
            4
          </button>
        </li>
        <li>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-white text-[14px] font-medium text-gray-900 shadow outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-300 disabled:shadow-none data-[selected]:bg-gray-900 data-[selected]:text-white dark:border dark:border-zinc-700 dark:bg-transparent dark:text-gray-100 dark:shadow dark:ring-1 dark:ring-white/10 dark:hover:bg-gray-900 dark:active:bg-gray-800 dark:disabled:border-none dark:disabled:bg-zinc-900 dark:disabled:text-gray-700 dark:data-[selected]:border-none dark:data-[selected]:bg-gray-100 dark:data-[selected]:text-gray-900"
            ngpPaginationButton
            ngpPaginationButtonPage="5"
            aria-label="Page 5"
          >
            5
          </button>
        </li>
        <li>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-white text-[14px] font-medium text-gray-900 shadow outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none data-[selected]:bg-gray-900 data-[selected]:text-white dark:border dark:border-zinc-700 dark:bg-transparent dark:text-gray-100 dark:shadow dark:ring-1 dark:ring-white/10 dark:hover:bg-gray-900 dark:active:bg-gray-800 dark:disabled:border-none dark:disabled:bg-zinc-900 dark:disabled:text-gray-300 dark:data-[selected]:border-none dark:data-[selected]:bg-gray-100 dark:data-[selected]:text-gray-900"
            ngpPaginationNext
            aria-label="Next Page"
          >
            <ng-icon name="heroChevronRight" />
          </button>
        </li>
        <li>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-lg border-none bg-white text-[14px] font-medium text-gray-900 shadow outline-none transition-colors duration-200 hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 active:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none data-[selected]:bg-gray-900 data-[selected]:text-white dark:border dark:border-zinc-700 dark:bg-transparent dark:text-gray-100 dark:shadow dark:ring-1 dark:ring-white/10 dark:hover:bg-gray-900 dark:active:bg-gray-800 dark:disabled:border-none dark:disabled:bg-zinc-900 dark:disabled:text-gray-300 dark:data-[selected]:border-none dark:data-[selected]:bg-gray-100 dark:data-[selected]:text-gray-900"
            ngpPaginationLast
            aria-label="Last Page"
          >
            <ng-icon name="heroChevronDoubleRight" />
          </button>
        </li>
      </ul>
    </nav>
  `,
  styles: ``,
})
export default class PaginationExample {
  /**
   * The currently selected page.
   */
  readonly page = signal<number>(1);
}
