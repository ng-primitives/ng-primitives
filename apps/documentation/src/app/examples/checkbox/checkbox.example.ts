import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';

@Component({
  selector: 'app-checkbox',
  imports: [NgIcon, NgpCheckbox],
  providers: [provideIcons({ heroCheckMini })],
  styles: `
    [ngpCheckbox] {
      display: inline-flex;
      vertical-align: middle;
      width: 1.25rem;
      height: 1.25rem;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      border-radius: 0.4375rem;
      border: 1.5px solid var(--ngp-border-secondary);
      background-color: var(--ngp-background);
      padding: 0;
      outline: none;
      flex: none;
      color: var(--ngp-primary-text);
      font-size: 0.8125rem;
      transition:
        background-color 160ms cubic-bezier(0.4, 0, 0.2, 1),
        border-color 160ms cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow 160ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpCheckbox][data-hover] {
      border-color: var(--ngp-primary);
    }

    [ngpCheckbox][data-checked],
    [ngpCheckbox][data-indeterminate] {
      border-color: var(--ngp-primary);
      background-color: var(--ngp-primary);
      box-shadow:
        inset 0 1px 0 0 rgba(255, 255, 255, 0.28),
        0 1px 1px 0 rgba(0, 0, 0, 0.06);
    }

    [ngpCheckbox][data-checked][data-hover],
    [ngpCheckbox][data-indeterminate][data-hover] {
      border-color: var(--ngp-primary-hover);
      background-color: var(--ngp-primary-hover);
    }

    [ngpCheckbox][data-focus-visible] {
      box-shadow:
        0 0 0 2px var(--ngp-background),
        0 0 0 4px var(--ngp-focus-ring);
    }

    [ngpCheckbox] ng-icon {
      display: block;
      width: 0.8125rem;
      height: 0.8125rem;
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
