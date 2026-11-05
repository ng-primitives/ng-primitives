import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import {
  NgpAutocomplete,
  NgpAutocompleteButton,
  NgpAutocompleteDropdown,
  NgpAutocompleteInput,
  NgpAutocompleteOption,
  NgpAutocompletePortal,
} from 'ng-primitives/autocomplete';

@Component({
  selector: 'app-autocomplete',
  imports: [
    NgpAutocomplete,
    NgpAutocompleteDropdown,
    NgpAutocompleteOption,
    NgpAutocompleteInput,
    NgpAutocompletePortal,
    NgpAutocompleteButton,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronDown })],
  template: `
    <div
      [ngpAutocompleteSelectedValue]="value()"
      (ngpAutocompleteSelected)="onSelected($event)"
      ngpAutocomplete
    >
      <input
        [value]="query()"
        (input)="onInput($event)"
        placeholder="Search a character"
        ngpAutocompleteInput
      />

      <button ngpAutocompleteButton aria-label="Toggle dropdown">
        <ng-icon name="heroChevronDown" />
      </button>

      <div *ngpAutocompletePortal ngpAutocompleteDropdown>
        @for (option of filteredOptions(); track option) {
          <div [ngpAutocompleteOptionValue]="option" ngpAutocompleteOption>
            {{ option }}
          </div>
        } @empty {
          <div class="empty-message">No options found</div>
        }
      </div>
    </div>
  `,
  styles: `
    [ngpAutocomplete] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 2.125rem;
      width: 300px;
      border-radius: 0.5rem;
      border: none;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-input-shadow);
      box-sizing: border-box;
    }

    [ngpAutocomplete][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpAutocompleteInput] {
      flex: 1;
      padding: 0 16px;
      border: none;
      background-color: transparent;
      color: var(--ngp-text-primary);
      font-family: inherit;
      font-size: 14px;
      outline: none;
      height: 100%;
    }

    [ngpAutocompleteButton] {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 36px;
      background-color: transparent;
      border: none;
      color: var(--ngp-text-primary);
      cursor: pointer;
      box-sizing: border-box;
    }

    [ngpAutocompleteDropdown] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0.25rem;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      width: var(--ngp-autocomplete-width);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      margin-top: 4px;
      max-height: 240px;
      overflow-y: auto;
      z-index: 1001;
    }

    [ngpAutocompleteDropdown][data-enter] {
      animation: autocomplete-show 0.1s ease-out;
    }

    [ngpAutocompleteDropdown][data-exit] {
      animation: autocomplete-hide 0.1s ease-out;
    }

    [ngpAutocompleteOption] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      border-radius: 0.5rem;
      width: 100%;
      height: 2.125rem;
      font-size: 14px;
      color: var(--ngp-text-primary);
      box-sizing: border-box;
    }

    [ngpAutocompleteOption][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpAutocompleteOption][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpAutocompleteOption][data-active] {
      background-color: var(--ngp-background-active);
    }

    [ngpAutocompleteOption][data-selected] {
      color: var(--ngp-primary);
      font-weight: 510;
    }

    .empty-message {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.5rem;
      color: var(--ngp-text-secondary);
      font-size: 14px;
      font-weight: 510;
      text-align: center;
    }

    @keyframes autocomplete-show {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes autocomplete-hide {
      0% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      100% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
    }
  `,
})
export default class AutocompleteExample {
  /** The options for the autocomplete. */
  readonly options: string[] = [
    'Marty McFly',
    'Doc Brown',
    'Biff Tannen',
    'George McFly',
    'Jennifer Parker',
    'Emmett Brown',
    'Einstein',
    'Clara Clayton',
    'Needles',
    'Goldie Wilson',
    'Marvin Berry',
    'Lorraine Baines',
    'Strickland',
  ];

  /** The chosen option, if the text still names one. */
  readonly value = signal<string | undefined>(undefined);

  /** The text in the input. */
  readonly query = signal<string>('');

  /** The text the options are filtered by. */
  readonly filter = signal<string>('');

  /** Get the filtered options. */
  protected readonly filteredOptions = computed(() =>
    this.options.filter(option => option.toLowerCase().includes(this.filter().toLowerCase())),
  );

  protected onInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.query.set(text);
    this.filter.set(text);

    // the text no longer names the chosen option
    if (text !== this.value()) {
      this.value.set(undefined);
    }
  }

  protected onSelected(option: string): void {
    this.value.set(option);
    this.query.set(option);
    // list every option again, so reopening shows the chosen one among the others
    this.filter.set('');
  }
}
