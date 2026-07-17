import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
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

@Component({
  selector: 'app-drawer-non-modal',
  imports: [
    NgpButton,
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
    <ng-container [modal]="false" disablePointerDismissal ngpDrawer swipeDirection="right">
      <button ngpButton ngpDrawerTrigger>Open non-modal drawer</button>
      <ng-template ngpDrawerPortal>
        <div class="viewport" ngpDrawerViewport>
          <aside class="drawer" ngpDrawerPopup>
            <div ngpDrawerContent>
              <h2 ngpDrawerTitle>Reading list</h2>
              <p ngpDrawerDescription>
                This drawer leaves the page interactive and does not trap focus.
              </p>
              <ul>
                <li>Design systems for teams</li>
                <li>Accessible motion patterns</li>
                <li>Building composable primitives</li>
              </ul>
              <button ngpButton ngpDrawerClose>Close</button>
            </div>
          </aside>
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
      height: 2.125rem;
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

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .viewport {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      justify-content: flex-end;
      pointer-events: none;
      touch-action: none;
    }

    .drawer {
      width: min(22rem, calc(100vw - 3rem));
      height: 100%;
      padding: 1.5rem;
      overflow-y: auto;
      pointer-events: auto;
      touch-action: auto;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border-inline-start: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow);
      outline: none;
      transform: translateX(var(--ngp-drawer-swipe-movement-x));
      transition: transform 400ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .drawer[data-starting-style],
    .drawer[data-ending-style] {
      transform: translateX(calc(100% + 2px));
    }

    .drawer[data-swiping] {
      transition-duration: 0ms;
      user-select: none;
    }

    h2 {
      margin: 0 0 0.25rem;
      font-size: 1.125rem;
    }

    p {
      margin: 0;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    ul {
      display: grid;
      gap: 0.75rem;
      margin-block: 1.5rem;
      padding: 0;
      list-style: none;
    }

    li {
      padding: 0.875rem;
      border-radius: 0.5rem;
      background: var(--ngp-background-secondary);
      font-size: 0.875rem;
    }
  `,
})
export default class DrawerNonModalExample {}
