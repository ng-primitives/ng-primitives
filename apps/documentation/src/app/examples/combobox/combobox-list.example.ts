import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import { heroCheckSolid } from '@ng-icons/heroicons/solid';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxList,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';

@Component({
  selector: 'app-combobox-list',
  imports: [
    NgpCombobox,
    NgpComboboxButton,
    NgpComboboxDropdown,
    NgpComboboxInput,
    NgpComboboxList,
    NgpComboboxOption,
    NgpComboboxPortal,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronDown, heroCheckSolid })],
  template: `
    <div
      [(ngpComboboxValue)]="value"
      [ngpComboboxDropdownContainer]="container"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      ngpComboboxMultiple
      ngpCombobox
    >
      <input
        #input
        [value]="filter()"
        (input)="onFilterChange($event)"
        placeholder="Select characters..."
        ngpComboboxInput
      />

      <button ngpComboboxButton aria-label="Toggle dropdown">
        <ng-icon name="heroChevronDown" />
      </button>

      <!-- The dropdown renders here, after the input, so Tab reaches the button inside it. -->
      <div #container></div>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        <!-- The list stays rendered while it is empty: only the options come and go. -->
        <div ngpComboboxList aria-label="Characters">
          @for (option of filteredOptions(); track option) {
            <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
              {{ option }}
              @if (isSelected(option)) {
                <ng-icon name="heroCheckSolid" />
              }
            </div>
          }
        </div>

        @if (filteredOptions().length === 0) {
          <div class="empty-message">No options found</div>
        }

        <div class="footer">
          <span>{{ value().length }} selected</span>
          <button [disabled]="value().length === 0" (click)="clear(input)" type="button">
            Clear
          </button>
        </div>
      </div>
    </div>
  `,
  styles: `
    [ngpCombobox] {
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

    [ngpCombobox][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpComboboxInput] {
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

    [ngpComboboxInput]::placeholder {
      color: var(--ngp-text-tertiary);
    }

    [ngpComboboxButton] {
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

    [ngpComboboxDropdown] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0.25rem;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      animation: combobox-list-show 0.1s ease-out;
      width: var(--ngp-combobox-width);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      margin-top: 4px;
      z-index: 1001;
    }

    [ngpComboboxDropdown][data-exit] {
      animation: combobox-list-hide 0.1s ease-out;
    }

    [ngpComboboxList] {
      max-height: 200px;
      overflow-y: auto;
    }

    [ngpComboboxOption] {
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

    [ngpComboboxOption][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpComboboxOption][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpComboboxOption][data-active] {
      background-color: var(--ngp-background-active);
    }

    [ngpComboboxOption] ng-icon {
      margin-left: auto;
      color: var(--ngp-primary);
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

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.25rem;
      padding: 0.5rem 0.25rem 0.25rem 0.75rem;
      border-top: 1px solid var(--ngp-border);
      color: var(--ngp-text-secondary);
      font-size: 12px;
      letter-spacing: -0.011em;
    }

    .footer button {
      padding: 0.25rem 0.75rem;
      border: none;
      border-radius: 0.5rem;
      background-color: transparent;
      color: var(--ngp-text-primary);
      font-family: inherit;
      font-size: 12px;
      font-weight: 510;
      cursor: pointer;
    }

    .footer button:hover:not(:disabled) {
      background-color: var(--ngp-background-hover);
    }

    .footer button:active:not(:disabled) {
      background-color: var(--ngp-background-active);
    }

    .footer button:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 1px;
    }

    .footer button:disabled {
      color: var(--ngp-text-disabled);
      cursor: not-allowed;
    }

    @keyframes combobox-list-show {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes combobox-list-hide {
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
export default class ComboboxListExample {
  /** The options for the combobox. */
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

  /** The selected values. */
  readonly value = signal<string[]>([]);

  /** The filter value. */
  readonly filter = signal<string>('');

  /** Get the filtered options. */
  protected readonly filteredOptions = computed(() =>
    this.options.filter(option => option.toLowerCase().includes(this.filter().toLowerCase())),
  );

  protected isSelected(option: string): boolean {
    return this.value().includes(option);
  }

  protected onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.set(input.value);
  }

  /** Clear the selection and return focus to the input, as the button disables itself. */
  protected clear(input: HTMLInputElement): void {
    this.value.set([]);
    input.focus();
  }

  protected resetOnClose(open: boolean): void {
    if (!open) {
      this.filter.set('');
    }
  }
}
