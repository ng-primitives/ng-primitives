import { Component, signal } from '@angular/core';
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

@Component({
  selector: 'app-drawer-uncontained',
  imports: [
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
    <ng-container [open]="open()" (openChange)="open.set($event)" ngpDrawer>
      <button class="trigger" ngpDrawerTrigger>Open action sheet</button>
      <ng-template ngpDrawerPortal>
        <div class="backdrop" ngpDrawerBackdrop></div>
        <div class="viewport" ngpDrawerViewport>
          <section class="sheet" ngpDrawerPopup>
            <div class="action-group" ngpDrawerContent>
              <h2 class="visually-hidden" ngpDrawerTitle>Profile actions</h2>
              <p class="visually-hidden" ngpDrawerDescription>Choose an action for this user.</p>
              @for (action of actions; track action) {
                <button (click)="open.set(false)" type="button">{{ action }}</button>
              }
            </div>
            <div class="action-group danger-group">
              <button (click)="open.set(false)" type="button">Block user</button>
            </div>
            <button class="visually-hidden" ngpDrawerClose>Close action sheet</button>
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

    button {
      min-height: 2.5rem;
      padding-inline: 1rem;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border: 0;
      font: inherit;
      font-size: 0.875rem;
      outline: none;
    }

    button:hover {
      background: var(--ngp-background-hover);
    }

    button:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: -2px;
    }

    .trigger {
      min-height: 2.125rem;
      border-radius: 0.5rem;
      box-shadow: inset 0 0 0 1px var(--ngp-border);
    }

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgb(0 0 0 / 50%);
      opacity: calc(1 - var(--ngp-drawer-swipe-progress));
      transition: opacity 400ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .viewport {
      position: fixed;
      inset: 0;
      z-index: 1001;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      touch-action: none;
    }

    .sheet {
      display: grid;
      width: min(22rem, 100%);
      gap: 0.75rem;
      padding: 1rem 1rem max(1rem, env(safe-area-inset-bottom));
      pointer-events: none;
      outline: none;
      transform: translateY(var(--ngp-drawer-swipe-movement-y));
      transition: transform 400ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .sheet[data-starting-style],
    .sheet[data-ending-style] {
      transform: translateY(calc(100% + 1rem));
    }

    .backdrop[data-starting-style],
    .backdrop[data-ending-style] {
      opacity: 0;
    }

    [data-swiping] {
      transition-duration: 0ms;
      user-select: none;
    }

    .action-group {
      display: grid;
      overflow: hidden;
      pointer-events: auto;
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.75rem;
      box-shadow: var(--ngp-shadow);
    }

    .action-group button + button {
      border-block-start: 1px solid var(--ngp-border);
    }

    .danger-group button {
      color: var(--ngp-danger, #b42318);
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }
  `,
})
export default class DrawerUncontainedExample {
  readonly open = signal(false);
  readonly actions = ['Unfollow', 'Mute', 'Add to favorites', 'Restrict'] as const;
}
