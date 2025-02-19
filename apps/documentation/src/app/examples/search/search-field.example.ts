import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMagnifyingGlass } from '@ng-icons/heroicons/outline';
import { NgpButton } from 'ng-primitives/button';
import { NgpLabel } from 'ng-primitives/form-field';
import { NgpInput } from 'ng-primitives/input';
import { NgpSearchField, NgpSearchFieldClear } from 'ng-primitives/search';

@Component({
  selector: 'app-search-field',
  imports: [
    NgpSearchField,
    NgpLabel,
    NgpInput,
    NgIcon,
    NgpButton,
    NgpSearchFieldClear,
    FormsModule,
  ],
  providers: [provideIcons({ heroMagnifyingGlass })],
  template: `
    <div ngpSearchField>
      <label ngpLabel>Find a customer</label>
      <div class="search-container">
        <ng-icon name="heroMagnifyingGlass" />
        <input [(ngModel)]="query" ngpInput type="search" placeholder="Search for a customer" />
        <button ngpSearchFieldClear ngpButton aria-label="Clear search">Clear</button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: contents;
    }

    [ngpSearchField] {
      display: flex;
      flex-direction: column;
      gap: 6px;
      width: 90%;
    }

    [ngpInput] {
      height: 36px;
      width: 100%;
      border-radius: 8px;
      padding: 0 16px 0 40px;
      border: none;
      box-shadow: var(--input-shadow);
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
      outline: 2px solid var(--focus-ring);
      outline-offset: 0px;
    }

    [ngpInput]::placeholder {
      color: var(--text-placeholder);
    }

    [ngpLabel] {
      color: var(--text-primary);
      font-size: 0.875rem;
      line-height: 1.25rem;
      font-weight: 500;
      margin: 0;
    }

    .search-container {
      position: relative;
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
      color: var(--text-blue);
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
      color: var(--text-tertiary);
    }
  `,
})
export default class SearchFieldExample {
  /**
   * Store the search query.
   */
  readonly query = signal<string>('');
}
