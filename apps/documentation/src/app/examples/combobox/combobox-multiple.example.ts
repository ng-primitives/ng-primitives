import { Component, computed, signal, ElementRef, viewChild } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown, heroXMark } from '@ng-icons/heroicons/outline';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxInput,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';

@Component({
  selector: 'app-combobox-multiple-example',
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxOption,
    NgpComboboxInput,
    NgpComboboxPortal,
    NgpComboboxButton,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronDown, heroXMark })],
  template: `
    <!-- Combobox multiple with chips -->
    <div
      [(ngpComboboxValue)]="value"
      (ngpComboboxValueChange)="filter.set('')"
      (ngpComboboxOpenChange)="resetOnClose($event)"
      ngpComboboxMultiple
      ngpCombobox
    >
      <div class="input-container" [class.py-1]="value().length > 0">
        @if (value().length > 0) {
          <div class="chips-container">
            @for (selectedOption of value(); track selectedOption; let i = $index) {
              <div class="chip" #chipElement [class.chip-focused]="focusedChipIndex() === i">
                <span class="chip-text">{{ selectedOption }}</span>
                <button
                  class="chip-remove"
                  [attr.aria-label]="'Remove ' + selectedOption"
                  (click)="removeOption(selectedOption)"
                  type="button"
                >
                  <ng-icon name="heroXMark" />
                </button>
              </div>
            }
          </div>
        }
        <input
          #inputElement
          [class.chips]="value().length > 0"
          [value]="filter()"
          (input)="onFilterChange($event)"
          (keydown)="onInputKeyDown($event)"
          placeholder="Select an option"
          ngpComboboxInput
        />
      </div>
      <button ngpComboboxButton aria-label="Toggle dropdown">
        <ng-icon name="heroChevronDown" />
      </button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        @for (option of filteredOptions(); track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
            {{ option }}
            @if (isSelected(option)) {
              <span class="checkmark">✓</span>
            }
          </div>
        } @empty {
          <div class="empty-message">No options found</div>
        }
      </div>
    </div>
  `,
  styles: `
    [ngpCombobox] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 300px;
      min-height: 36px;
      border-radius: 8px;
      border: none;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-input-shadow);
      box-sizing: border-box;
    }

    [ngpCombobox][data-focus] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .input-container {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: 100%;
    }

    [ngpComboboxInput] {
      padding: 0 16px;
      border: none;
      background-color: transparent;
      color: var(--ngp-text);
      font-family: inherit;
      font-size: 14px;
      outline: none;
      height: 100%;
      width: inherit;
    }

    [ngpComboboxInput].chips {
      padding-left: 16px;
      padding-block: 8px;
    }

    [ngpComboboxInput]::placeholder {
      color: var(--ngp-text-secondary);
    }

    [ngpComboboxButton] {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 36px;
      background-color: transparent;
      border: none;
      color: var(--ngp-text);
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
      animation: popover-show 0.1s ease-out;
      width: var(--ngp-combobox-width);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      margin-top: 4px;
      max-height: 240px;
      overflow-y: auto;
      z-index: 1001;
    }

    [ngpComboboxDropdown][data-enter] {
      animation: combobox-show 0.1s ease-out;
    }

    [ngpComboboxDropdown][data-exit] {
      animation: combobox-hide 0.1s ease-out;
    }

    [ngpComboboxOption] {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      cursor: pointer;
      border-radius: 0.5rem;
      width: 100%;
      height: 36px;
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

    [ngpcomboboxoption] .checkmark {
      font-weight: bold;
      margin-left: auto;
    }

    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      padding-left: 8px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      background-color: var(--ngp-background-active);
      border: 1px solid var(--ngp-border-secondary);
      border-radius: 16px;
      padding: 2px 6px 2px 8px;
      font-size: 12px;
      font-weight: 500;
      color: var(--ngp-text-primary);
      max-width: 200px;
      transition: all 0.15s ease;
    }

    .chip:hover {
      background-color: var(--ngp-background-secondary);
    }

    .chip-focused .chip-remove {
      color: white;
      background-color: var(--ngp-text-red);
      opacity: 1;
    }

    .chip-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-right: 4px;
      user-select: none;
    }

    .chip-remove {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      border: none;
      background: transparent;
      color: var(--ngp-text-secondary);
      cursor: pointer;
      border-radius: 50%;
      font-size: 14px;
      line-height: 1;
      padding: 0;
      transition: all 0.15s ease;
      opacity: 0.6;
    }

    .chip-remove:hover {
      opacity: 1;
      background-color: var(--ngp-text-red);
      color: white;
    }

    .chip-remove:focus {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 1px;
    }

    .empty-message {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.5rem;
      color: var(--ngp-text-secondary);
      font-size: 14px;
      font-weight: 500;
      text-align: center;
    }

    @keyframes combobox-show {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes combobox-hide {
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
export default class ComboboxMultipleExample {
  readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputElement');

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

  /** The selected values for multiple selection. */
  readonly value = signal<string[]>([]);

  /** The filter value. */
  readonly filter = signal<string>('');

  /** The index of the currently focused chip (-1 means no chip is focused). */
  readonly focusedChipIndex = signal<number>(-1);

  /** Get the filtered options. */
  protected readonly filteredOptions = computed(() =>
    this.options.filter(option => option.toLowerCase().includes(this.filter().toLowerCase())),
  );

  protected onFilterChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filter.set(input.value);
    // Reset focused chip when user starts typing
    this.focusedChipIndex.set(-1);
  }

  protected onInputKeyDown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const currentValue = this.value();

    if (event.key === 'Backspace') {
      if (input.value === '' && currentValue.length > 0) {
        event.preventDefault();
        const currentFocusedIndex = this.focusedChipIndex();

        if (currentFocusedIndex === -1) {
          this.focusedChipIndex.set(currentValue.length - 1);
        } else {
          const optionToRemove = currentValue[currentFocusedIndex];
          this.removeOption(optionToRemove);
          // reset focused chip index and restore focus to input
          this.focusedChipIndex.set(-1);
          this.inputElement().nativeElement.focus();
        }
      } else {
        this.focusedChipIndex.set(-1);
      }
      return;
    }
    this.focusedChipIndex.set(-1);
  }

  protected resetOnClose(open: boolean): void {
    // if the dropdown is closed, reset the filter value and focused chip
    if (open) {
      return;
    }
    this.filter.set('');
    this.focusedChipIndex.set(-1);
  }

  protected isSelected(option: string): boolean {
    return this.value().includes(option);
  }

  protected removeOption(option: string): void {
    const currentValue = this.value();
    const updatedValue = currentValue.filter(item => item !== option);
    this.value.set(updatedValue);

    // Reset focused chip index after removal
    this.focusedChipIndex.set(-1);
  }
}
