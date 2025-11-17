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
    <div class="flex w-[90%] flex-col gap-1.5" ngpFormField>
      <label class="text-sm font-medium text-gray-900 dark:text-gray-100" ngpLabel>
        Find a customer
      </label>
      <div class="relative" ngpSearch>
        <ng-icon
          class="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-500 dark:text-gray-400"
          name="heroMagnifyingGlass"
        />
        <input
          class="h-9 w-full min-w-0 rounded-lg border-none bg-white py-0 pl-10 pr-4 text-gray-900 shadow-xs outline-hidden ring-1 ring-black/10 placeholder:text-gray-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-transparent dark:text-gray-100 dark:ring-white/10 dark:placeholder:text-gray-400"
          [(ngModel)]="query"
          ngpInput
          type="search"
          placeholder="Search for a customer"
        />
        <button
          class="absolute right-0 top-0 block h-9 cursor-pointer rounded-r-lg border-none bg-transparent px-4 text-sm text-blue-500 outline-hidden data-empty:hidden"
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
      width: 90%;
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
