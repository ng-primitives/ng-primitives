import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronUpDownMini } from '@ng-icons/heroicons/mini';
import { NgpButton } from 'ng-primitives/button';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-custom-anchor',
  imports: [NgpButton, NgpMenu, NgpMenuTrigger, NgpMenuItem, NgIcon],
  providers: [provideIcons({ heroChevronUpDownMini })],
  template: `
    <button
      class="row"
      [ngpMenuTrigger]="menu"
      [ngpMenuTriggerAnchor]="chevron"
      ngpMenuTriggerPlacement="bottom-end"
      ngpMenuTriggerOffset="12"
      ngpButton
    >
      <span class="row-label">Sort by</span>
      <span class="row-value">
        Recently updated
        <span class="chevron" #chevron>
          <ng-icon name="heroChevronUpDownMini" size="16" />
        </span>
      </span>
    </button>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Recently updated</button>
        <button ngpMenuItem>Name</button>
        <button ngpMenuItem>Date created</button>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: contents;
    }

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
      max-width: 20rem;
      height: 2.125rem;
      padding: 0 0.625rem;
      border: none;
      border-radius: 0.625rem;
      background-color: var(--ngp-background);
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 1px 2px 0 rgb(0 0 0 / 0.04);
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      outline: none;
    }

    .row[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    .row[data-press] {
      background-color: var(--ngp-background-active);
    }

    .row[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 1px;
    }

    .row-label {
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
    }

    .row-value {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
    }

    .chevron {
      display: inline-flex;
      color: var(--ngp-text-tertiary);
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
export default class MenuCustomAnchorExample {}
