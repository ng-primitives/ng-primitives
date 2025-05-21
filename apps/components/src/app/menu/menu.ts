import { Component } from '@angular/core';
import { NgpMenu, NgpMenuItem } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu',
  imports: [NgpMenu, NgpMenuItem],
  template: `
    <div ngpMenu>
      <button ngpMenuItem>Item 1</button>
      <button ngpMenuItem>Item 2</button>
      <button ngpMenuItem>Item 3</button>
    </div>
  `,
  styles: `
    [ngpMenu] {
      position: fixed;
      display: flex;
      flex-direction: column;
      width: max-content;
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow);
      border-radius: 8px;
      padding: 4px;
      animation: menu-show 300ms ease-out;
    }

    [ngpMenu][data-exit] {
      animation: menu-hide 300ms ease-out;
    }

    [ngpMenuItem] {
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

    [ngpMenuItem][data-hover] {
      background-color: var(--ngp-background-active);
    }

    [ngpMenuItem][data-focus-visible] {
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
export class Menu {}
