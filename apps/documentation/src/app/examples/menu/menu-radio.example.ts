import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuItemIndicator,
  NgpMenuItemRadio,
  NgpMenuItemRadioGroup,
  NgpMenuTrigger,
} from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-radio',
  imports: [
    NgpButton,
    NgpMenu,
    NgpMenuItem,
    NgpMenuTrigger,
    NgpMenuItemRadioGroup,
    NgpMenuItemRadio,
    NgpMenuItemIndicator,
  ],
  template: `
    <button [ngpMenuTrigger]="menu" ngpButton>Theme</button>

    <ng-template #menu>
      <div ngpMenu>
        <div [(ngpMenuItemRadioGroupValue)]="theme" ngpMenuItemRadioGroup>
          <button ngpMenuItemRadio ngpMenuItemRadioValue="light">
            <span class="indicator" ngpMenuItemIndicator></span>
            Light
          </button>
          <button ngpMenuItemRadio ngpMenuItemRadioValue="dark">
            <span class="indicator" ngpMenuItemIndicator></span>
            Dark
          </button>
          <button ngpMenuItemRadio ngpMenuItemRadioValue="system">
            <span class="indicator" ngpMenuItemIndicator></span>
            System
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
    }

    [ngpButton][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
    }

    [ngpButton][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpMenu] {
      position: fixed;
      display: flex;
      flex-direction: column;
      width: max-content;
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow-lg);
      border-radius: 8px;
      padding: 4px;
      transform-origin: var(--ngp-menu-transform-origin);
    }

    [ngpMenu][data-enter] {
      animation: menu-show 0.1s ease-out;
    }

    [ngpMenu][data-exit] {
      animation: menu-hide 0.1s ease-out;
    }

    [ngpMenuItemRadio] {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 4px;
      min-width: 160px;
      text-align: start;
      outline: none;
      font-size: 14px;
      font-weight: 400;
    }

    [ngpMenuItemRadio][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpMenuItemRadio][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpMenuItemRadio][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      z-index: 1;
    }

    .indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 1.5px solid var(--ngp-border);
      box-sizing: border-box;
      transition:
        border-color 0.15s,
        background-color 0.15s;
    }

    .indicator::after {
      content: '';
      display: block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: var(--ngp-text-blue);
      transform: scale(0);
      transition: transform 0.15s ease;
    }

    .indicator[data-checked] {
      border-color: var(--ngp-border-blue);
    }

    .indicator[data-checked]::after {
      transform: scale(1);
    }

    @keyframes menu-show {
      0% {
        opacity: 0;
        transform: scale(0.9);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes menu-hide {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      100% {
        opacity: 0;
        transform: scale(0.9);
      }
    }
  `,
})
export default class MenuRadioExample {
  theme = 'system';
}
