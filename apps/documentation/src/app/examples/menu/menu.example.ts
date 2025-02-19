import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem],
  template: `
    <button [ngpMenuTrigger]="menu" ngpButton>Open Menu</button>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Item 1</button>
        <button ngpMenuItem>Item 2</button>
        <button ngpMenuItem>Item 3</button>
      </div>
    </ng-template>
  `,
  styles: `
    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--text-primary);
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--button-shadow);
    }

    [ngpButton][data-hover] {
      background-color: var(--background-hover);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--focus-ring);
    }

    [ngpButton][data-press] {
      background-color: var(--background-active);
    }

    [ngpMenu] {
      display: flex;
      flex-direction: column;
      width: max-content;
      background: var(--background);
      border: 1px solid var(--border);
      box-shadow: var(--shadow);
      border-radius: 8px;
      padding: 2px;
      margin: 2px 0;
    }

    [ngpMenuItem] {
      padding: 8px 16px;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.2s;
      border-radius: 6px;
      min-width: 120px;
      text-align: start;
      outline: none;
    }

    [ngpMenuItem][data-hover] {
      background-color: var(--background-active);
    }

    [ngpMenuItem][data-focus-visible] {
      outline: 2px solid var(--focus-ring);
    }
  `,
})
export default class MenuExample {}
