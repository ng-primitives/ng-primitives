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
      <label class="text-sm font-[510] text-zinc-900 dark:text-zinc-100" ngpLabel>
        Find a customer
      </label>
      <div class="relative" ngpSearch>
        <ng-icon
          class="absolute top-1/2 left-3 -translate-y-1/2 text-xl text-zinc-500! dark:text-zinc-400!"
          name="heroMagnifyingGlass"
        />
        <input
          class="h-[2.125rem] w-full min-w-0 rounded-lg border-none bg-white py-0 pr-4 pl-10 text-sm tracking-[-0.006em] text-zinc-900 shadow-[0_1px_2px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] outline-hidden placeholder:text-zinc-400 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[0_1px_2px_rgba(255,255,255,0.007),0_0_0_1px_rgba(255,255,255,0.1)] dark:focus:outline-blue-400"
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
