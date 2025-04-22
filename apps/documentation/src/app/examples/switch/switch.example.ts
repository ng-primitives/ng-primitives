import { Component } from '@angular/core';
import { NgpSwitch, NgpSwitchThumb } from 'ng-primitives/switch';

@Component({
  selector: 'app-switch',
  imports: [NgpSwitch, NgpSwitchThumb],
  styles: `
    [ngpSwitch] {
      position: relative;
      width: 2.5rem;
      height: 1.5rem;
      border-radius: 999px;
      background-color: var(--ngp-background-secondary);
      border: 1px solid var(--ngp-border);
      padding: 0;
      outline: none;
      transition-property: color, background-color, border-color, text-decoration-color, fill,
        stroke;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }

    [ngpSwitch][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    [ngpSwitch][data-checked] {
      background-color: var(--ngp-background-inverse);
      border-color: var(--ngp-border-inverse);
    }

    [ngpSwitchThumb] {
      display: block;
      height: 1.25rem;
      width: 1.25rem;
      border-radius: 999px;
      background-color: white;
      box-shadow: var(--ngp-button-shadow);
      outline: none;
      transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
      transform: translateX(1px);
    }

    [ngpSwitchThumb][data-checked] {
      transform: translateX(17px);
    }
  `,
  template: `
    <button ngpSwitch>
      <span ngpSwitchThumb></span>
    </button>
  `,
})
export default class SwitchExample {}
