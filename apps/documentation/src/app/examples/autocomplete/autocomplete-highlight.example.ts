import { Component, computed, signal } from '@angular/core';
import {
  NgpAutocomplete,
  NgpAutocompleteDropdown,
  NgpAutocompleteInput,
  NgpAutocompleteOption,
  NgpAutocompletePortal,
} from 'ng-primitives/autocomplete';

@Component({
  selector: 'app-autocomplete-highlight',
  imports: [
    NgpAutocomplete,
    NgpAutocompleteDropdown,
    NgpAutocompleteOption,
    NgpAutocompleteInput,
    NgpAutocompletePortal,
  ],
  template: `
    <div
      [ngpAutocompleteSelectedValue]="value()"
      (ngpAutocompleteSelected)="onSelected($event)"
      (ngpAutocompleteActiveValueChange)="active.set($event)"
      (ngpAutocompleteOpenChange)="onOpenChange($event)"
      ngpAutocomplete
      ngpAutocompleteAutoActivate
    >
      <input
        [value]="query()"
        [ngpAutocompleteInputSuggestion]="active()"
        (input)="onInput($event)"
        placeholder="Search a country"
        ngpAutocompleteInput
      />

      <div *ngpAutocompletePortal ngpAutocompleteDropdown>
        @for (country of filteredCountries(); track country) {
          <div [ngpAutocompleteOptionValue]="country" ngpAutocompleteOption>
            {{ country }}
          </div>
        } @empty {
          <div class="empty-message">No countries found</div>
        }
      </div>
    </div>
  `,
  styles: `
    [ngpAutocomplete] {
      display: flex;
      align-items: center;
      height: 2.125rem;
      width: 300px;
      border-radius: 0.5rem;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-input-shadow);
      box-sizing: border-box;
    }

    [ngpAutocomplete]:focus-within {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpAutocompleteInput] {
      flex: 1;
      height: 100%;
      padding: 0 12px;
      border: none;
      background-color: transparent;
      color: var(--ngp-text-primary);
      font-family: inherit;
      font-size: 14px;
      letter-spacing: -0.006em;
      outline: none;
    }

    [ngpAutocompleteInput]::placeholder {
      color: var(--ngp-text-tertiary);
    }

    [ngpAutocompleteDropdown] {
      position: absolute;
      width: var(--ngp-autocomplete-width);
      max-height: 240px;
      margin-top: 4px;
      padding: 0.25rem;
      overflow-y: auto;
      border: 1px solid var(--ngp-border);
      border-radius: 0.75rem;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      outline: none;
      z-index: 1001;
    }

    [ngpAutocompleteOption] {
      display: flex;
      align-items: center;
      height: 2.125rem;
      padding: 0 0.75rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      font-size: 14px;
      letter-spacing: -0.006em;
      cursor: pointer;
      box-sizing: border-box;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpAutocompleteOption][data-hover],
    [ngpAutocompleteOption][data-active] {
      background-color: var(--ngp-background-hover);
    }

    [ngpAutocompleteOption][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpAutocompleteOption][data-selected] {
      color: var(--ngp-primary);
      font-weight: 510;
    }

    .empty-message {
      padding: 0.5rem;
      color: var(--ngp-text-secondary);
      font-size: 14px;
      text-align: center;
    }
  `,
})
export default class AutocompleteHighlightExample {
  readonly shouldFilter = signal(false);

  readonly countries = [
    'Argentina',
    'Australia',
    'Austria',
    'Belgium',
    'Brazil',
    'Canada',
    'Chile',
    'Denmark',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Iceland',
    'India',
    'Ireland',
    'Italy',
    'Japan',
    'Mexico',
    'Netherlands',
    'New Zealand',
    'Norway',
    'Portugal',
    'Spain',
    'Sweden',
    'Switzerland',
  ];

  /** The chosen country, if the text still names one. */
  readonly value = signal<string | undefined>(undefined);

  /** The text the user typed. */
  readonly query = signal('');

  /** The active country, whose name completes the typed text. */
  readonly active = signal<string | undefined>(undefined);

  // the completion only shows for a name that starts with the typed text
  protected readonly filteredCountries = computed(() =>
    this.shouldFilter()
      ? this.countries.filter(country =>
          country.toLowerCase().startsWith(this.query().toLowerCase()),
        )
      : this.countries,
  );

  protected onInput(event: Event): void {
    this.shouldFilter.set(true);
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);

    if (text !== this.value()) {
      this.value.set(undefined);
    }
  }

  protected onSelected(country: string): void {
    this.value.set(country);
    this.query.set(country);
  }
  protected onOpenChange(isOpen: boolean): void {
    if (isOpen) {
      // Disabled filter on opening, so all options is visible again once the user start typing again
      this.shouldFilter.set(false);
    }
  }
}
