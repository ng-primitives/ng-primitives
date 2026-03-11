import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheckMini } from '@ng-icons/heroicons/mini';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpMenu,
  NgpMenuItem,
  NgpMenuItemCheckbox,
  NgpMenuItemIndicator,
  NgpMenuTrigger,
} from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-checkbox',
  imports: [
    NgpButton,
    NgpMenu,
    NgpMenuItem,
    NgpMenuTrigger,
    NgpMenuItemCheckbox,
    NgpMenuItemIndicator,
    NgIcon,
  ],
  providers: [provideIcons({ heroCheckMini })],
  template: `
    <button [ngpMenuTrigger]="menu" ngpButton>View Options</button>

    <ng-template #menu>
      <div ngpMenu>
        <button
          ngpMenuItemCheckbox
          [(ngpMenuItemCheckboxChecked)]="showToolbar"
        >
          <span class="indicator" ngpMenuItemIndicator>
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          </span>
          Show Toolbar
        </button>
        <button
          ngpMenuItemCheckbox
          [(ngpMenuItemCheckboxChecked)]="showSidebar"
        >
          <span class="indicator" ngpMenuItemIndicator>
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          </span>
          Show Sidebar
        </button>
        <button
          ngpMenuItemCheckbox
          [(ngpMenuItemCheckboxChecked)]="showStatusBar"
        >
          <span class="indicator" ngpMenuItemIndicator>
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          </span>
          Show Status Bar
        </button>
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

    [ngpMenuItemCheckbox] {
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

    [ngpMenuItemCheckbox][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpMenuItemCheckbox][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpMenuItemCheckbox][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      z-index: 1;
    }

    .indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      color: var(--ngp-text-blue);
      visibility: hidden;
    }

    .indicator[data-checked] {
      visibility: visible;
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
export default class MenuCheckboxExample {
  showToolbar = true;
  showSidebar = true;
  showStatusBar = false;
}
