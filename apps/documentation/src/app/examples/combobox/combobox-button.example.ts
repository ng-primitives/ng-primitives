import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import {
  NgpCombobox,
  NgpComboboxButton,
  NgpComboboxDropdown,
  NgpComboboxOption,
  NgpComboboxPortal,
} from 'ng-primitives/combobox';

@Component({
  selector: 'app-combobox-button',
  imports: [
    NgpCombobox,
    NgpComboboxDropdown,
    NgpComboboxOption,
    NgpComboboxPortal,
    NgpComboboxButton,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronDown })],
  template: `
    <div [(ngpComboboxValue)]="value" ngpCombobox>
      <button ngpComboboxButton>
        {{ value() || 'Select a character' }}
        <ng-icon name="heroChevronDown" />
      </button>

      <div *ngpComboboxPortal ngpComboboxDropdown>
        @for (option of options; track option) {
          <div [ngpComboboxOptionValue]="option" ngpComboboxOption>
            {{ option }}
          </div>
        }
      </div>
    </div>
  `,
  styles: `
    [ngpCombobox] {
      display: inline-block;
      width: 300px;
    }

    [ngpCombobox]:focus-within {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
      border-radius: 8px;
    }

    [ngpComboboxButton] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      height: 36px;
      padding: 0 16px;
      border-radius: 8px;
      border: none;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-input-shadow);
      color: var(--ngp-text);
      font-family: inherit;
      font-size: 14px;
      cursor: pointer;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    [ngpComboboxButton]:hover {
      background-color: var(--ngp-background-hover);
    }

    [ngpComboboxButton][aria-expanded='true'] {
      background-color: var(--ngp-background-active);
    }

    [ngpComboboxButton] ng-icon {
      transition: transform 0.2s ease;
      width: 16px;
      height: 16px;
    }

    [ngpComboboxButton][aria-expanded='true'] ng-icon {
      transform: rotate(180deg);
    }

    [ngpComboboxDropdown] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0.25rem;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      width: var(--ngp-combobox-width);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      margin-top: 4px;
      max-height: 240px;
      overflow-y: auto;
      z-index: 1001;
      transform-origin: var(--ngp-combobox-transform-origin);
    }

    [ngpComboboxDropdown][data-enter] {
      animation: dropdown-show 0.15s ease-out;
    }

    [ngpComboboxDropdown][data-exit] {
      animation: dropdown-hide 0.15s ease-in;
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

    [ngpComboboxOption][data-selected] {
      background-color: var(--ngp-background-blue);
      color: var(--ngp-text-emphasis);
    }

    @keyframes dropdown-show {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes dropdown-hide {
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
export default class ComboboxButtonExample {
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

  /** The selected value. */
  readonly value = signal<string | undefined>(undefined);
}
