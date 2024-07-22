import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';

@Component({
  standalone: true,
  selector: 'app-checkbox',
  imports: [NgIcon, NgpCheckbox],
  viewProviders: [provideIcons({ heroCheckMini })],
  styles: `
    [ngpCheckbox] {
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
      flex: none;
    }

    [ngpCheckbox][data-hover='true'] {
      background-color: rgb(250 250 250);
    }

    [ngpCheckbox][data-checked='true'] {
      border-color: rgb(10 10 10);
      background-color: rgb(10 10 10);
    }

    [ngpCheckbox][data-focus-visible='true'] {
      box-shadow:
        0 1px 2px rgba(0, 0, 0, 0.05),
        0 0 0 2px rgb(255, 255, 255),
        0 0 0 4px rgb(59 130 246);
    }

    ng-icon {
      color: rgb(255 255 255);
      font-size: 0.75rem;
    }
  `,
  template: `
    <span [(ngpCheckboxChecked)]="checked" ngpCheckbox>
      @if (checked()) {
        <ng-icon name="heroCheckMini" aria-hidden="true" />
      }
    </span>
  `,
})
export default class CheckboxExample {
  /**
   * The checked state of the checkbox.
   */
  readonly checked = signal(true);
}
