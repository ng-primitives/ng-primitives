import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';

@Component({
  selector: 'app-checkbox-form-control',
  imports: [NgIcon, NgpCheckbox, NgpFormField, NgpLabel, NgpDescription],
  viewProviders: [provideIcons({ heroCheckMini })],
  styles: `
    [ngpFormField] {
      display: flex;
      column-gap: 0.75rem;
    }

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

    [ngpLabel] {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
      font-weight: 500;
      font-size: 14px;
      line-height: 14px;
      color: var(--ngp-text-primary);
    }

    [ngpDescription] {
      font-size: 12px;
      line-height: 16px;
      color: var(--ngp-text-secondary);
    }
  `,
  template: `
    <div ngpFormField>
      <span [(ngpCheckboxChecked)]="checked" ngpCheckbox>
        @if (checked()) {
          <ng-icon name="heroCheckMini" aria-hidden="true" />
        }
      </span>

      <label ngpLabel>
        <p>Enable notifications</p>
        <p ngpDescription>Receive notifications when someone follows you.</p>
      </label>
    </div>
  `,
})
export default class CheckboxFormFieldExample {
  /**
   * The checked state of the checkbox.
   */
  readonly checked = signal(true);
}
