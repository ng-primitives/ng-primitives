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
    :host {
      --button-color: rgb(10 10 10);
      --button-background-color: rgb(255 255 255);
      --button-hover-color: rgb(10 10 10);
      --button-hover-background-color: rgb(250 250 250);
      --button-pressed-background-color: rgb(245 245 245);

      --button-color-dark: rgb(255 255 255);
      --button-background-color-dark: rgb(43 43 43);
      --button-hover-color-dark: rgb(255 255 255);
      --button-hover-background-color-dark: rgb(63, 63, 70);
      --button-pressed-background-color-dark: rgb(39, 39, 42);
    }

    [ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: light-dark(var(--button-color), var(--button-color-dark));
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: light-dark(
        var(--button-background-color),
        var(--button-background-color-dark)
      );
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05);
    }

    [ngpButton][data-hover] {
      background-color: light-dark(
        var(--button-hover-background-color),
        var(--button-hover-background-color-dark)
      );
    }

    [ngpButton][data-focus-visible] {
      box-shadow:
        0 1px 3px 0 rgb(0 0 0 / 0.1),
        0 1px 2px -1px rgb(0 0 0 / 0.1),
        0 0 0 1px rgb(0 0 0 / 0.05),
        0 0 0 2px light-dark(#005fcc, #99c8ff);
    }

    [ngpButton][data-press] {
      background-color: light-dark(
        var(--button-pressed-background-color),
        var(--button-pressed-background-color-dark)
      );
    }

    [ngpMenu] {
      display: flex;
      flex-direction: column;
      width: max-content;
      background: light-dark(#fff, #27272a);
      box-shadow:
        0 0 10px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      padding: 2px;
      margin: 2px 0;
    }

    [ngpMenuItem] {
      padding: 8px 16px;
      border: none;
      background: none;
      cursor: pointer;
      transition: background 0.2s;
      border-radius: 6px;
      min-width: 120px;
      text-align: start;
      outline: none;
    }

    [ngpMenuItem][data-hover] {
      background: light-dark(#f5f5f5, #3f3f46);
    }

    [ngpMenuItem][data-focus-visible] {
      box-shadow: 0 0 0 2px light-dark(#005fcc, #99c8ff);
    }
  `,
})
export default class MenuExample {}
