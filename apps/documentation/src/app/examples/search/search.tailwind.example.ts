import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass } from '@ng-icons/heroicons/outline';
import { NgpButton } from 'ng-primitives/button';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpInput } from 'ng-primitives/input';
import { NgpSearch, NgpSearchClear } from 'ng-primitives/search';

@Component({
  selector: 'app-search-tailwind',
  imports: [
    NgpSearch,
    NgpLabel,
    NgpInput,
    NgIcon,
    NgpButton,
    NgpSearchClear,
    FormsModule,
    NgpFormField,
  ],
  providers: [provideIcons({ heroMagnifyingGlass })],
  template: `
    <div class="flex w-[300px] flex-col gap-1.5" ngpFormField>
      <label class="text-sm font-[510] text-gray-900 dark:text-gray-100" ngpLabel>
        Find a customer
      </label>
      <div class="relative" ngpSearch>
        <ng-icon
          class="absolute top-1/2 left-3 -translate-y-1/2 text-xl text-gray-500 dark:text-gray-400"
          name="heroMagnifyingGlass"
        />
        <input
          class="h-[2.125rem] w-full min-w-0 rounded-lg border-none bg-white py-0 pr-4 pl-10 text-sm tracking-[-0.006em] text-gray-900 shadow-xs ring-1 ring-black/10 outline-hidden placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-transparent dark:text-gray-100 dark:ring-white/10 dark:placeholder:text-gray-400 dark:focus:outline-blue-400"
          [(ngModel)]="query"
          ngpInput
          type="search"
          placeholder="Search for a customer"
        />
        <button
          class="absolute top-0 right-0 block h-[2.125rem] cursor-pointer rounded-r-[0.625rem] border-none bg-transparent px-4 text-sm text-[#f01e2b] outline-hidden data-empty:hidden dark:text-[#ff4651]"
          ngpSearchClear
          ngpButton
          aria-label="Clear search"
        >
          Clear
        </button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
      width: 300px;
    }

    /* clears the 'X' from Chrome */
    [ngpInput]::-webkit-search-decoration,
    [ngpInput]::-webkit-search-cancel-button,
    [ngpInput]::-webkit-search-results-button,
    [ngpInput]::-webkit-search-results-decoration {
      display: none;
    }
  `,
})
export default class SearchTailwindExample {
  /**
   * Store the search query.
   */
  readonly query = signal<string>('');
}
