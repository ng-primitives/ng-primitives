import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';

@Component({
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
      border: 1px solid var(--ngp-border);
      background-color: transparent;
      padding: 0;
      outline: none;
      flex: none;
    }

    [ngpCheckbox][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpCheckbox][data-checked] {
      border-color: var(--ngp-background-inverse);
      background-color: var(--ngp-background-inverse);
    }

    [ngpCheckbox][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    ng-icon {
      color: var(--ngp-text-inverse);
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
