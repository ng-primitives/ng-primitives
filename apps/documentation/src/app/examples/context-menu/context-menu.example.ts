import { Component } from '@angular/core';
import {
  NgpContextMenu,
  NgpContextMenuItem,
  NgpContextMenuTrigger,
} from 'ng-primitives/context-menu';

@Component({
  selector: 'app-context-menu',
  imports: [NgpContextMenu, NgpContextMenuTrigger, NgpContextMenuItem],
  template: `
    <div class="trigger" [ngpContextMenuTrigger]="menu">Right-click me</div>

    <ng-template #menu>
      <div ngpContextMenu>
        <button ngpContextMenuItem>Cut</button>
        <button ngpContextMenuItem>Copy</button>
        <button ngpContextMenuItem>Paste</button>
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
      padding: 0.4375rem 0.75rem;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      border-radius: 0.375rem;
      min-width: 140px;
      text-align: start;
      outline: none;
      font-size: 0.875rem;
      font-weight: 510;
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
export default class ContextMenuExample {}
