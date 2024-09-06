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
    :host {
      --checkbox-background-color: rgb(255 255 255);
      --checkbox-border-color: rgb(229 229 229);
      --checkbox-background-hover: rgb(250 250 250);
      --checkbox-border-checked: rgb(10 10 10);
      --checkbox-background-checked: rgb(10 10 10);
      --checkbox-outline-focus: rgb(59 130 246);
      --checkbox-icon-color: rgb(255 255 255);

      --checkbox-background-color-dark: rgb(43 43 43);
      --checkbox-border-color-dark: rgb(128 128 128);
      --checkbox-background-hover-dark: rgb(43 43 43);
      --checkbox-border-checked-dark: rgb(255 255 255);
      --checkbox-background-checked-dark: rgb(255 255 255);
      --checkbox-outline-focus-dark: rgb(59 130 246);
      --checkbox-icon-color-dark: rgb(43 43 43);
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
      padding: 0;
      outline: none;
      flex: none;
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
      outline: 2px solid
        light-dark(var(--checkbox-outline-focus), var(--checkbox-outline-focus-dark));
      outline-offset: 2px;
    }

    ng-icon {
      color: light-dark(var(--checkbox-icon-color), var(--checkbox-icon-color-dark));
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
