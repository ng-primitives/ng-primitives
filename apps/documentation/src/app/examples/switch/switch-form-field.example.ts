import { Component } from '@angular/core';
import { NgpFormField, NgpLabel } from 'ng-primitives/form-field';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
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
      color: var(--text-primary);
    }

    [ngpSwitch] {
      position: relative;
      width: 2.5rem;
      height: 1.5rem;
      border-radius: 999px;
      background-color: var(--background-secondary);
      border: 1px solid var(--border);
      padding: 0;
      outline: none;
      transition-property: color, background-color, border-color, text-decoration-color, fill,
        stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    [ngpSwitch][data-focus-visible] {
      outline: 2px solid var(--focus-ring);
    }

    [ngpSwitch][data-checked] {
      background-color: var(--background-blue);
      border-color: var(--border-blue);
    }

    [ngpSwitchThumb] {
      display: block;
      height: 1.25rem;
      width: 1.25rem;
      border-radius: 999px;
      background-color: white;
      box-shadow: var(--button-shadow);
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
