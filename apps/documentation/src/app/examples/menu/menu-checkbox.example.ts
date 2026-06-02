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
        <button [(ngpMenuItemCheckboxChecked)]="showToolbar" ngpMenuItemCheckbox>
          <span class="indicator" ngpMenuItemIndicator>
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          </span>
          Show Toolbar
        </button>
        <button [(ngpMenuItemCheckboxChecked)]="showSidebar" ngpMenuItemCheckbox>
          <span class="indicator" ngpMenuItemIndicator>
            <ng-icon name="heroCheckMini" aria-hidden="true" />
          </span>
          Show Sidebar
        </button>
        <button [(ngpMenuItemCheckboxChecked)]="showStatusBar" ngpMenuItemCheckbox>
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

    [ngpMenuItemCheckbox] {
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

    [ngpMenuItemCheckbox][data-hover],
    [ngpMenuItemCheckbox][data-focus-visible] {
      background-color: var(--ngp-background-hover);
    }

    [ngpMenuItemCheckbox][data-press] {
      background-color: var(--ngp-background-active);
    }

    .indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      color: var(--ngp-primary);
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
