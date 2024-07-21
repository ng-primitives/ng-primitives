import { Component } from '@angular/core';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
  standalone: true,
  selector: 'app-switch-form-field',
  imports: [NgpSwitch, NgpSwitchThumb, NgpFormField, NgpLabel],
  styles: `
    [ngpFormField] {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    [ngpLabel] {
      font-weight: 500;
      color: rgb(10 10 10);
    }

    [ngpSwitch] {
      position: relative;
      width: 2.5rem;
      height: 1.5rem;
      border-radius: 999px;
      background-color: rgb(229 229 229);
      border: 1px solid rgb(212 212 212);
      padding: 0;
      outline: none;
      transition-property: color, background-color, border-color, text-decoration-color, fill,
        stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    [ngpSwitch][data-focus-visible='true'] {
      box-shadow:
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px rgb(59 130 246);
    }

    [ngpSwitch][data-checked='true'] {
      background-color: rgb(10 10 10);
      border-color: rgb(10 10 10);
    }

    [ngpSwitchThumb] {
      display: block;
      height: 1.25rem;
      width: 1.25rem;
      border-radius: 999px;
      background-color: rgb(255 255 255);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
      outline: none;
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateX(1px);
    }

    [ngpSwitchThumb][data-checked='true'] {
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
