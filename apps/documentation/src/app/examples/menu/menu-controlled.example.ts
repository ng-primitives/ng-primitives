import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-controlled',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem],
  template: `
    <div class="row">
      <button [(ngpMenuTriggerOpen)]="open" [ngpMenuTrigger]="menu" ngpButton>Actions</button>
      <button (click)="open.set(true)" ngpButton>Open from code</button>
    </div>
    <p class="status">The menu is {{ open() ? 'open' : 'closed' }}.</p>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Rename</button>
        <button ngpMenuItem>Duplicate</button>
        <button ngpMenuItem>Archive</button>
      </div>
    </ng-template>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status {
      margin: 0.75rem 0 0;
      font-size: 0.8125rem;
      letter-spacing: -0.011em;
      color: var(--ngp-text-secondary);
    }

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
      padding: 0.4375rem 0.75rem;
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
export default class MenuControlledExample {
  readonly open = signal(false);
}
