import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRightMini } from '@ng-icons/heroicons/mini';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger, NgpSubmenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-submenu',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem, NgpSubmenuTrigger, NgIcon],
  providers: [provideIcons({ heroChevronRightMini })],
  template: `
    <button [ngpMenuTrigger]="menu" ngpButton>Open Menu</button>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Item 1</button>
        <button ngpMenuItem>Item 2</button>
        <button [ngpSubmenuTrigger]="submenu" ngpMenuItem>
          Item 3
          <ng-icon name="heroChevronRightMini" />
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpMenu>
        <button ngpMenuItem>Item 1</button>
        <button ngpMenuItem>Item 2</button>
        <button ngpMenuItem>Item 3</button>
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
      animation: menu-show 0.2s ease-out;
      transform-origin: var(--ngp-popover-transform-origin);
    }

    [ngpMenu][data-exit] {
      animation: menu-hide 0.2s ease-out;
    }

    [ngpMenuItem] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.4375rem 0.5rem 0.4375rem 0.75rem;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.15s ease;
      border-radius: 0.375rem;
      min-width: 140px;
      text-align: start;
      outline: none;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
    }

    [ngpMenuItem][data-hover],
    [ngpMenuItem][data-focus-visible] {
      background-color: var(--ngp-background-hover);
    }

    [ngpMenuItem][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpMenuItem] ng-icon {
      margin-left: 0.75rem;
      color: var(--ngp-text-tertiary);
      --ng-icon__size: 1rem;
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
export default class MenuExample {}
