import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronDown } from '@ng-icons/heroicons/outline';
import {
  NgpSelect,
  NgpSelectDropdown,
  NgpSelectOption,
  NgpSelectPortal,
} from 'ng-primitives/select';

@Component({
  selector: 'app-select-custom-option',
  imports: [NgpSelect, NgpSelectDropdown, NgpSelectOption, NgpSelectPortal, NgIcon],
  providers: [provideIcons({ heroChevronDown })],
  template: `
    <div [(ngpSelectValue)]="value" ngpSelect>
      @if (value(); as value) {
        <span class="select-value">{{ value }}</span>
      } @else {
        <span class="select-placeholder">Select an option</span>
      }
      <ng-icon name="heroChevronDown" />

      <div *ngpSelectPortal ngpSelectDropdown>
        <div class="clear-option" (click)="clear()" ngpSelectOption>
          None
        </div>

        <div class="divider"></div>

        @for (option of options; track option) {
          <div [ngpSelectOptionValue]="option" ngpSelectOption>
            {{ option }}
          </div>
        } @empty {
          <div class="empty-message">No options found</div>
        }
      </div>
    </div>
  `,
  styles: `
    [ngpSelect] {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 36px;
      width: 300px;
      border-radius: 8px;
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
      padding: 0 16px;
      height: 100%;
    }

    .select-placeholder {
      color: var(--ngp-text-secondary);
    }

    ng-icon {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      margin-inline: 8px;
      font-size: 14px;
    }

    [ngpSelectDropdown] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 0.25rem;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      animation: popover-show 0.1s ease-out;
      width: var(--ngp-select-width);
      box-shadow: var(--ngp-shadow-lg);
      box-sizing: border-box;
      margin-top: 4px;
      max-height: 240px;
      overflow-y: auto;
      z-index: 1001;
    }

    [ngpSelectDropdown][data-enter] {
      animation: select-show 0.1s ease-out;
    }

    [ngpSelectDropdown][data-exit] {
      animation: select-hide 0.1s ease-out;
    }

    [ngpSelectOption] {
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

    [ngpSelectOption][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpSelectOption][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpSelectOption][data-active] {
      background-color: var(--ngp-background-active);
    }

    .clear-option {
      color: var(--ngp-text-secondary);
      font-style: italic;
    }

    .divider {
      height: 1px;
      background-color: var(--ngp-border);
      margin: 0.25rem 0;
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

    @keyframes select-show {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes select-hide {
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
export default class SelectCustomOptionExample {
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

  /** The selected value. */
  readonly value = signal<string | undefined>(undefined);

  /** Clear the selection. */
  clear(): void {
    this.value.set(undefined);
  }
}
