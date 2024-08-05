import { Component, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import { NgpCheckbox } from 'ng-primitives/checkbox';
import { NgpDescription, NgpFormField, NgpLabel } from 'ng-primitives/form-field';

@Component({
  standalone: true,
  selector: 'app-checkbox-form-control',
  imports: [NgIcon, NgpCheckbox, NgpFormField, NgpLabel, NgpDescription],
  viewProviders: [provideIcons({ heroCheckMini })],
  styles: `
    :host {
      --checkbox-background-color: rgb(255 255 255);
      --checkbox-border-color: rgb(229 229 229);
      --checkbox-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      --checkbox-background-hover: rgb(250 250 250);
      --checkbox-border-checked: rgb(10 10 10);
      --checkbox-background-checked: rgb(10 10 10);
      --checkbox-box-shadow-focus: 0 1px 2px rgba(0, 0, 0, 0.05), 0 0 0 2px rgb(255, 255, 255),
        0 0 0 4px rgb(59 130 246);
      --checkbox-icon-color: rgb(255 255 255);

      --checkbox-background-color-dark: rgb(43 43 43);
      --checkbox-border-color-dark: rgb(128 128 128);
      --checkbox-box-shadow-dark: 0 1px 2px rgba(255, 255, 255, 0.9);
      --checkbox-background-hover-dark: rgb(43 43 43);
      --checkbox-border-checked-dark: rgb(255 255 255);
      --checkbox-background-checked-dark: rgb(255 255 255);
      --checkbox-box-shadow-focus-dark: 0 1px 2px rgba(255, 255, 255, 0.9),
        0 0 0 2px rgb(59 130 246), 0 0 0 4px rgb(59 130 246);
      --checkbox-icon-color-dark: rgb(43 43 43);

      --form-field-label-color: rgb(255 255 255);
      --form-field-description-color: rgb(113 113 122);

      --form-field-label-color-dark: rgb(225, 225, 225);
      --form-field-description-color-dark: rgb(161 161 170);
    }

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
      border: 1px solid light-dark(var(--checkbox-border-color), var(--checkbox-border-color-dark));
      background-color: light-dark(
        var(--checkbox-background-color),
        var(--checkbox-background-color-dark)
      );
      box-shadow: 0 1px 2px light-dark(var(--checkbox-box-shadow), var(--checkbox-box-shadow-dark));
      padding: 0;
      flex: none;
      outline: none;
    }

    [ngpCheckbox][data-hover='true'] {
      background-color: light-dark(
        var(--checkbox-background-hover),
        var(--checkbox-background-hover-dark)
      );
    }

    [ngpCheckbox][data-checked='true'] {
      border-color: light-dark(var(--checkbox-border-checked), var(--checkbox-border-checked-dark));
      background-color: light-dark(
        var(--checkbox-background-checked),
        var(--checkbox-background-checked-dark)
      );
    }

    [ngpCheckbox][data-focus-visible='true'] {
      box-shadow: light-dark(
        var(--checkbox-box-shadow-focus),
        var(--checkbox-box-shadow-focus-dark)
      );
    }

    ng-icon {
      color: light-dark(var(--checkbox-icon-color), var(--checkbox-icon-color-dark));
      font-size: 0.75rem;
    }

    [ngpLabel] {
      display: flex;
      flex-direction: column;
      row-gap: 0.5rem;
      font-weight: 500;
      font-size: 14px;
      line-height: 14px;
      color: light-dark(var(--form-field-label-color), var(--form-field-label-color-dark));
    }

    [ngpDescription] {
      font-size: 12px;
      line-height: 16px;
      color: light-dark(
        var(--form-field-description-color),
        var(--form-field-description-color-dark)
      );
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
