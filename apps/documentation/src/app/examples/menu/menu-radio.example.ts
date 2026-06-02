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
      padding-inline: 0.875rem;
      border-radius: 0.625rem;
      color: var(--ngp-text-primary);
      border: none;
      outline: none;
      height: 2.125rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
    }

    [ngpButton][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 1px;
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
      border-radius: 0.625rem;
      padding: 0.25rem;
      outline: none;
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
      padding: 0.4375rem 0.75rem;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.15s ease;
      border-radius: 0.375rem;
      min-width: 160px;
      text-align: start;
      outline: none;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
    }

    [ngpMenuItemRadio][data-hover],
    [ngpMenuItemRadio][data-focus-visible] {
      background-color: var(--ngp-background-hover);
    }

    [ngpMenuItemRadio][data-press] {
      background-color: var(--ngp-background-active);
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
      background-color: var(--ngp-primary);
      transform: scale(0);
      transition: transform 0.15s ease;
    }

    .indicator[data-checked] {
      border-color: var(--ngp-primary);
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
