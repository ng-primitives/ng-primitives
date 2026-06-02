import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRightMini } from '@ng-icons/heroicons/mini';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuSubmenuTrigger,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';

@Component({
  selector: 'app-context-menu-submenu',
  imports: [
    NgpContextMenu,
    NgpContextMenuTrigger,
    NgpContextMenuItem,
    NgpContextMenuSubmenuTrigger,
    NgIcon,
  ],
  providers: [provideIcons({ heroChevronRightMini })],
  template: `
    <div class="trigger" [ngpContextMenuTrigger]="menu">Right-click me</div>

    <ng-template #menu>
      <div ngpContextMenu>
        <button ngpContextMenuItem>Cut</button>
        <button ngpContextMenuItem>Copy</button>
        <button [ngpContextMenuSubmenuTrigger]="submenu" ngpContextMenuItem>
          More
          <ng-icon name="heroChevronRightMini" />
        </button>
      </div>
    </ng-template>

    <ng-template #submenu>
      <div ngpContextMenu>
        <button ngpContextMenuItem>Paste</button>
        <button ngpContextMenuItem>Paste Special</button>
        <button ngpContextMenuItem>Delete</button>
      </div>
    </ng-template>
  `,
  styles: `
    .trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 300px;
      height: 150px;
      border: 2px dashed var(--ngp-border);
      border-radius: 0.75rem;
      color: var(--ngp-text-secondary);
      font-size: 14px;
      letter-spacing: -0.006em;
      user-select: none;
    }

    [ngpContextMenu] {
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

    [ngpContextMenu][data-enter] {
      animation: menu-show 0.1s ease-out;
    }

    [ngpContextMenu][data-exit] {
      animation: menu-hide 0.1s ease-out;
    }

    [ngpContextMenuItem] {
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
      font-weight: 500;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
    }

    [ngpContextMenuItem][data-hover],
    [ngpContextMenuItem][data-focus-visible] {
      background-color: var(--ngp-background-hover);
    }

    [ngpContextMenuItem][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpContextMenuItem] ng-icon {
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
export default class ContextMenuSubmenuExample {}
