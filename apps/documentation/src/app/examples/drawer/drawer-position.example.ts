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

@Component({
  selector: 'app-drawer-position',
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
      <button ngpButton ngpDrawerTrigger>Open bottom drawer</button>
      <ng-template ngpDrawerPortal>
        <div class="backdrop" ngpDrawerBackdrop></div>
        <div class="viewport" ngpDrawerViewport>
          <section class="sheet" ngpDrawerPopup>
            <div class="handle" aria-hidden="true"></div>
            <div ngpDrawerContent>
              <h2 ngpDrawerTitle>Notifications</h2>
              <p ngpDrawerDescription>You are all caught up. Good job!</p>
              <button ngpButton ngpDrawerClose>Close</button>
            </div>
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
      height: 2.125rem;
      padding-inline: 0.875rem;
      border: 0;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 1px 2px 0 rgb(0 0 0 / 4%);
      font-size: 0.875rem;
      outline: none;
      font-weight: 510;
      letter-spacing: -0.006em;
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
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
      background: var(--ngp-backdrop);
      opacity: calc(1 - var(--ngp-drawer-swipe-progress));
      transition: opacity 450ms cubic-bezier(0.32, 0.72, 0, 1);
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
      width: 100%;
      max-height: 80dvh;
      padding: 0.875rem 1.5rem max(1.5rem, env(safe-area-inset-bottom));
      overflow-y: auto;
      touch-action: auto;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border-block-start: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow);
      outline: none;
      transform: translateY(var(--ngp-drawer-swipe-movement-y));
      transition: transform 450ms cubic-bezier(0.32, 0.72, 0, 1);
      will-change: transform;
    }

    .sheet[data-starting-style],
    .sheet[data-ending-style] {
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

    .handle {
      width: 3rem;
      height: 0.25rem;
      margin: 0 auto 1rem;
      border-radius: 999px;
      background: var(--ngp-border);
    }

    [ngpDrawerContent] {
      display: grid;
      justify-items: center;
      gap: 0.75rem;
      max-width: 32rem;
      margin-inline: auto;
      text-align: center;
    }

    h2,
    p {
      margin: 0;
    }

    h2 {
      font-size: 1.125rem;
      color: var(--ngp-text-primary);
      font-weight: 590;
      letter-spacing: -0.014em;
    }

    p {
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      letter-spacing: -0.006em;
    }

    @media (prefers-reduced-motion: reduce) {
      .sheet,
      .backdrop {
        transition-duration: 0ms;
      }
    }
  `,
})
export default class DrawerPositionExample {}
