import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDrawerBackdrop,
  NgpDrawerClose,
  NgpDrawerContent,
  NgpDrawerDescription,
  NgpDrawerPopup,
  NgpDrawerPortal,
  NgpDrawer,
  NgpDrawerTitle,
  NgpDrawerTrigger,
  NgpDrawerViewport,
} from 'ng-primitives/drawer';

interface NavigationItem {
  readonly href: string;
  readonly label: string;
}

@Component({
  selector: 'app-drawer-mobile-nav',
  imports: [
    NgpButton,
    NgpDrawerBackdrop,
    NgpDrawerClose,
    NgpDrawerContent,
    NgpDrawerDescription,
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawer,
    NgpDrawerTitle,
    NgpDrawerTrigger,
    NgpDrawerViewport,
  ],
  template: `
    <ng-container ngpDrawer>
      <button ngpButton ngpDrawerTrigger>Open mobile menu</button>
      <ng-template ngpDrawerPortal>
        <div class="backdrop" ngpDrawerBackdrop></div>
        <div class="viewport" ngpDrawerViewport>
          <section class="menu" ngpDrawerPopup>
            <nav aria-label="Documentation navigation">
              <header>
                <div class="handle" aria-hidden="true"></div>
                <button ngpButton ngpDrawerClose aria-label="Close menu">Close</button>
              </header>
              <div ngpDrawerContent>
                <h2 ngpDrawerTitle>Menu</h2>
                <p ngpDrawerDescription>
                  Scroll this list or swipe down from its top edge to dismiss it.
                </p>
                <ul>
                  @for (item of items; track item.label) {
                    <li>
                      <a [href]="item.href" (click)="$event.preventDefault()" ngpDrawerClose>
                        {{ item.label }}
                      </a>
                    </li>
                  }
                </ul>
              </div>
            </nav>
          </section>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: `
    :host {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    [ngpButton] {
      min-height: 2.125rem;
      padding-inline: 0.875rem;
      border: 0;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      box-shadow: inset 0 0 0 1px var(--ngp-border);
      font-size: 0.875rem;
      outline: none;
    }

    [ngpButton][data-hover] {
      background: var(--ngp-background-hover);
    }

    [ngpButton][data-press] {
      background: var(--ngp-background-active);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: linear-gradient(to bottom, rgb(0 0 0 / 25%), rgb(0 0 0 / 50%));
      opacity: calc(1 - var(--ngp-drawer-swipe-progress));
      transition: opacity 500ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .viewport {
      position: fixed;
      inset: 0;
      z-index: 1001;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      overflow-y: auto;
      touch-action: none;
    }

    .menu {
      width: min(42rem, 100%);
      max-height: calc(100dvh - 2rem);
      overflow-y: auto;
      touch-action: auto;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-block-end: 0;
      border-radius: 0.75rem 0.75rem 0 0;
      box-shadow: var(--ngp-shadow);
      outline: none;
      transform: translateY(var(--ngp-drawer-swipe-movement-y));
      transition: transform 500ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .menu[data-starting-style],
    .menu[data-ending-style] {
      transform: translateY(calc(100% + 2px));
    }

    .backdrop[data-starting-style],
    .backdrop[data-ending-style] {
      opacity: 0;
    }

    [data-swiping] {
      transition-duration: 0ms;
      user-select: none;
    }

    nav {
      min-height: 100%;
      padding: 1rem 1.5rem max(1.5rem, env(safe-area-inset-bottom));
    }

    header {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: start;
    }

    header [ngpButton] {
      grid-column: 3;
      justify-self: end;
    }

    .handle {
      grid-column: 2;
      width: 3rem;
      height: 0.25rem;
      margin-block-start: 0.25rem;
      border-radius: 999px;
      background: var(--ngp-border);
    }

    h2 {
      margin: 0;
      font-size: 1.125rem;
    }

    p {
      margin: 0.25rem 0 1.25rem;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
    }

    ul {
      display: grid;
      gap: 0.375rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    a {
      display: flex;
      min-height: 2.75rem;
      align-items: center;
      padding-inline: 0.875rem;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border-radius: 0.5rem;
      box-shadow: inset 0 0 0 1px var(--ngp-border);
      font-size: 0.875rem;
      text-decoration: none;
      outline: none;
    }

    a:hover {
      background: var(--ngp-background-hover);
    }

    a:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }
  `,
})
export default class DrawerMobileNavExample {
  readonly items: readonly NavigationItem[] = [
    'Overview',
    'Accordion',
    'Button',
    'Checkbox',
    'Collapsible',
    'Combobox',
    'Dialog',
    'Drawer',
    'Menu',
    'Navigation Menu',
    'Popover',
    'Select',
    'Slider',
    'Tabs',
    'Toast',
    'Tooltip',
  ].map(label => ({
    label,
    href: `/primitives/${label.toLowerCase().replaceAll(' ', '-')}`,
  }));
}
