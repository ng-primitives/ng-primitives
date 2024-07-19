import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import {
  NgpCheckbox,
  NgpCheckboxIndicator,
  NgpCheckboxInput,
  NgpCheckboxLabel,
} from 'ng-primitives/checkbox';

@Component({
  standalone: true,
  selector: 'app-checkbox',
  imports: [NgIcon, NgpCheckbox, NgpCheckboxIndicator, NgpCheckboxLabel, NgpCheckboxInput],
  viewProviders: [provideIcons({ heroCheckMini })],
  styles: `
    [ngpCheckbox] {
      display: flex;
      user-select: none;
      align-items: center;
      column-gap: 0.75rem;
    }

    [ngpCheckbox][data-hover='true'] [ngpCheckboxIndicator]:not([data-checked='false']) {
      background-color: rgb(250 250 250);
    }

    [ngpCheckboxIndicator] {
      display: flex;
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      border: 1px solid rgb(229 229 229);
      background-color: rgb(255 255 255);
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      padding: 0;
      outline: none;
    }

    [ngpCheckboxIndicator][data-checked='true'] {
      border-color: rgb(10 10 10);
      background-color: rgb(10 10 10);
    }

    [ngpCheckboxIndicator][data-focus-visible='true'] {
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.05),
        0 0 0 2px rgb(255, 255, 255),
        0 0 0 4px rgb(59 130 246);
    }

    [ngpCheckboxLabel] {
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(10 10 10);
    }

    ng-icon {
      color: rgb(255 255 255);
      font-size: 0.75rem;
    }
  `,
  template: `
    <div [(ngpCheckboxChecked)]="checked" ngpCheckbox>
      <input ngpCheckboxInput />

      <button ngpCheckboxIndicator>
        @if (checked()) {
          <ng-icon name="heroCheckMini" />
        }
      </button>
      <label ngpCheckboxLabel>Accept terms and conditions</label>
    </div>
  `,
})
export default class CheckboxExample {
  /**
   * The checked state of the checkbox.
   */
  readonly checked = signal(false);
}
