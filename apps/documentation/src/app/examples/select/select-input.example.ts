import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectInput,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';

@Component({
  selector: 'app-select-input',
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectInput, NgpSelectOption, NgpSelectPortal, NgIcon],
  providers: [provideIcons({ heroChevronDown })],
  template: `
    <div class="select-examples">
      <!-- Layout A: the input lives inside the dropdown, above a scrollable list -->
      <div class="select-field">
        <span class="select-label">Search inside the dropdown</span>

        <div [(ngpSelectValue)]="valueA" (ngpSelectOpenChange)="onOpenA($event)" ngpSelect>
          @if (valueA(); as value) {
            <span class="select-value">{{ value }}</span>
          } @else {
            <span class="select-placeholder">Select an option</span>
          }
          <ng-icon name="heroChevronDown" />

          <div *ngpSelectPortal ngpSelectDropdown>
            <input
              [value]="searchA()"
              (input)="onSearchA($event)"
              ngpSelectInput
              placeholder="Search…"
            />
            <div class="select-scrollable">
              @for (option of filteredOptionsA(); track option) {
                <div [ngpSelectOptionValue]="option" ngpSelectOption>
                  {{ option }}
                </div>
              } @empty {
                <div class="empty-message">No options found</div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Layout B: the input replaces the trigger value while the dropdown is open -->
      <div class="select-field">
        <span class="select-label">Search in the trigger</span>

        <div [(ngpSelectValue)]="valueB" (ngpSelectOpenChange)="onOpenB($event)" ngpSelect>
          @if (openB()) {
            <input
              [value]="searchB()"
              (input)="onSearchB($event)"
              ngpSelectInput
              placeholder="Search…"
            />
          } @else if (valueB(); as value) {
            <span class="select-value">{{ value }}</span>
          } @else {
            <span class="select-placeholder">Select an option</span>
          }
          <ng-icon name="heroChevronDown" />

          <div *ngpSelectPortal ngpSelectDropdown>
            <div class="select-scrollable">
              @for (option of filteredOptionsB(); track option) {
                <div [ngpSelectOptionValue]="option" ngpSelectOption>
                  {{ option }}
                </div>
              } @empty {
                <div class="empty-message">No options found</div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .select-examples {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .select-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .select-label {
      font-size: 13px;
      font-weight: 510;
      letter-spacing: -0.011em;
      color: var(--ngp-text-secondary);
    }

    [ngpSelect] {
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

    [ngpSelect][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .select-value,
    .select-placeholder {
      display: flex;
      align-items: center;
      flex: 1;
      padding: 0 16px;
      background-color: transparent;
      color: var(--ngp-text-primary);
      font-family: inherit;
      font-size: 14px;
      height: 100%;
    }

    .select-placeholder {
      color: var(--ngp-text-secondary);
    }

    [ngpSelectInput] {
      flex: 1;
      min-width: 0;
      padding: 0 16px;
      border: none;
      background-color: transparent;
      color: var(--ngp-text-primary);
      font-family: inherit;
      font-size: 14px;
      height: 100%;
      outline: none;
    }

    [ngpSelectInput]::placeholder {
      color: var(--ngp-text-tertiary);
    }

    ng-icon {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      margin-inline: 8px;
      font-size: 14px;
      color: var(--ngp-text-primary);
    }

    [ngpSelectDropdown] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      overflow: hidden;
      animation: select-input-show 0.1s ease-out;
      width: var(--ngp-select-width);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      margin-top: 4px;
      z-index: 1001;
    }

    [ngpSelectDropdown][data-exit] {
      animation: select-input-hide 0.1s ease-out;
    }

    /* Search field pinned at the top of the dropdown (layout A) */
    [ngpSelectDropdown] > [ngpSelectInput] {
      width: 100%;
      flex: none;
      height: 2.25rem;
      padding: 0 0.75rem;
      border-bottom: 1px solid var(--ngp-border);
    }

    [ngpSelectDropdown] > [ngpSelectInput][data-focus-visible] {
      border-bottom-color: var(--ngp-focus-ring);
      box-shadow: inset 0 -1px 0 0 var(--ngp-focus-ring);
    }

    .select-scrollable {
      max-height: 200px;
      overflow-y: auto;
      padding: 0.25rem;
    }

    [ngpSelectOption] {
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

    [ngpSelectOption][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpSelectOption][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpSelectOption][data-active] {
      background-color: var(--ngp-background-active);
    }

    [ngpSelectOption][data-selected] {
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

    @keyframes select-input-show {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes select-input-hide {
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
export default class SelectInputExample {
  /** The options for the select. */
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

  // Layout A — search inside the dropdown
  readonly valueA = signal<string | undefined>(undefined);
  readonly searchA = signal<string>('');
  protected readonly filteredOptionsA = computed(() =>
    this.options.filter(option => option.toLowerCase().includes(this.searchA().toLowerCase())),
  );

  // Layout B — search replaces the trigger when open
  readonly valueB = signal<string | undefined>(undefined);
  readonly searchB = signal<string>('');
  readonly openB = signal<boolean>(false);
  protected readonly filteredOptionsB = computed(() =>
    this.options.filter(option => option.toLowerCase().includes(this.searchB().toLowerCase())),
  );

  protected onSearchA(event: Event): void {
    this.searchA.set((event.target as HTMLInputElement).value);
  }

  protected onOpenA(open: boolean): void {
    // reset the filter once the dropdown closes
    if (!open) {
      this.searchA.set('');
    }
  }

  protected onSearchB(event: Event): void {
    this.searchB.set((event.target as HTMLInputElement).value);
  }

  protected onOpenB(open: boolean): void {
    this.openB.set(open);

    // reset the filter once the dropdown closes
    if (!open) {
      this.searchB.set('');
    }
  }
}
