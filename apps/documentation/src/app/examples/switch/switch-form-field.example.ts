import { Component } from '@angular/core';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
  standalone: true,
  selector: 'app-switch-form-field',
  imports: [NgpSwitch, NgpSwitchThumb, NgpFormField, NgpLabel],
  styles: `
    :host {
      --form-field-label-color: rgb(9 9 11);
      --switch-background-color: rgb(229 229 229);
      --switch-border-color: rgb(212 212 212);
      --switch-checked-background-color: rgb(10 10 10);
      --switch-checked-border-color: rgb(10 10 10);
      --switch-thumb-background-color: rgb(255 255 255);

      --form-field-label-color-dark: #e4e4e7;
      --switch-background-color-dark: rgb(43 43 47);
      --switch-border-color-dark: rgb(128 128 128);
      --switch-checked-background-color-dark: rgb(59 130 246);
      --switch-checked-border-color-dark: rgb(53, 115, 215);
      --switch-thumb-background-color-dark: rgb(255 255 255);
    }

    [ngpFormField] {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    [ngpLabel] {
      font-weight: 500;
      color: light-dark(var(--form-field-label-color), var(--form-field-label-color-dark));
    }

    [ngpSwitch] {
      position: relative;
      width: 2.5rem;
      height: 1.5rem;
      border-radius: 999px;
      background-color: light-dark(
        var(--switch-background-color),
        var(--switch-background-color-dark)
      );
      border: 1px solid light-dark(var(--switch-border-color), var(--switch-border-color-dark));
      padding: 0;
      outline: none;
      transition-property: color, background-color, border-color, text-decoration-color, fill,
        stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    [ngpSwitch][data-focus-visible] {
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px rgb(59 130 246);
    }

    [ngpSwitch][data-checked] {
      background-color: light-dark(
        var(--switch-checked-background-color),
        var(--switch-checked-background-color-dark)
      );
      border-color: light-dark(
        var(--switch-checked-border-color),
        var(--switch-checked-border-color-dark)
      );
    }

    [ngpSwitchThumb] {
      display: block;
      height: 1.25rem;
      width: 1.25rem;
      border-radius: 999px;
      background-color: light-dark(
        var(--switch-thumb-background-color),
        var(--switch-thumb-background-color-dark)
      );
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
      outline: none;
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateX(1px);
    }

    [ngpSwitchThumb][data-checked] {
      transform: translateX(17px);
    }
  `,
  template: `
    <div ngpFormField>
      <label ngpLabel>Mobile Data</label>
      <button ngpSwitch>
        <span ngpSwitchThumb></span>
      </button>
    </div>
  `,
})
export default class SwitchFormFieldExample {}
