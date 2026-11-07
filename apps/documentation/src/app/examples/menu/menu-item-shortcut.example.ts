import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuItemShortcut, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-item-shortcut',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem, NgpMenuItemShortcut],
  template: `
    <button [ngpMenuTrigger]="menu" ngpButton>Edit</button>

    <ng-template #menu>
      <div ngpMenu>
        @for (item of items; track item.label) {
          <button ngpMenuItem>
            {{ item.label }}
            <kbd [ngpMenuItemShortcutKeys]="item.keys" ngpMenuItemShortcut>{{ item.shortcut }}</kbd>
          </button>
        }
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
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 1px 2px 0 rgba(0, 0, 0, 0.04);
      cursor: pointer;
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

    [ngpMenuItem] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 0.4375rem 0.75rem;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.15s ease;
      border-radius: 0.375rem;
      min-width: 180px;
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

    [ngpMenuItemShortcut] {
      font-family: inherit;
      font-size: 0.75rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: var(--ngp-text-tertiary);
    }

    @keyframes menu-show {
      0% {
        opacity: 0;
        transform: scale(0.96);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes menu-hide {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [ngpMenu][data-enter],
      [ngpMenu][data-exit] {
        animation-duration: 0s;
      }
    }
  `,
})
export default class MenuItemShortcutExample {
  readonly items = [
    { label: 'Undo', shortcut: '⌘Z', keys: 'Meta+Z' },
    { label: 'Redo', shortcut: '⇧⌘Z', keys: 'Shift+Meta+Z' },
    { label: 'Duplicate', shortcut: '⌘D', keys: 'Meta+D' },
    { label: 'Archive', shortcut: '⌘E', keys: 'Meta+E' },
  ];
}
