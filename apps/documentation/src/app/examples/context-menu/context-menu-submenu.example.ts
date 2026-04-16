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
      border-radius: 8px;
      color: var(--ngp-text-secondary);
      font-size: 14px;
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
      border-radius: 8px;
      padding: 4px;
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
      padding: 6px 8px 6px 14px;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 4px;
      min-width: 120px;
      text-align: start;
      outline: none;
      font-size: 14px;
      font-weight: 400;
    }

    [ngpContextMenuItem][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpContextMenuItem][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpContextMenuItem][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      z-index: 1;
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
