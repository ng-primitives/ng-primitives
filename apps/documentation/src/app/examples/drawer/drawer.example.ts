import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDrawerBackdrop,
  NgpDrawerClose,
  NgpDrawerContent,
  NgpDrawerDescription,
  NgpDrawerPopup,
  NgpDrawerPortal,
  NgpDrawerRoot,
  NgpDrawerTitle,
  NgpDrawerTrigger,
  NgpDrawerViewport,
} from 'ng-primitives/drawer';

@Component({
  selector: 'app-drawer',
  imports: [
    NgpButton,
    NgpDrawerBackdrop,
    NgpDrawerClose,
    NgpDrawerContent,
    NgpDrawerDescription,
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawerRoot,
    NgpDrawerTitle,
    NgpDrawerTrigger,
    NgpDrawerViewport,
  ],
  template: `
    <ng-container ngpDrawerRoot swipeDirection="right">
      <button ngpButton ngpDrawerTrigger>Open drawer</button>

      <ng-template ngpDrawerPortal>
        <div class="backdrop" ngpDrawerBackdrop></div>
        <div class="viewport" ngpDrawerViewport>
          <section class="drawer" ngpDrawerPopup>
            <div ngpDrawerContent>
              <h2 ngpDrawerTitle>Account settings</h2>
              <p ngpDrawerDescription>
                Update your profile, notification preferences, and security settings.
              </p>
              <div class="field-list" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="actions">
                <button ngpButton ngpDrawerClose>Close</button>
              </div>
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
        0 1px 2px rgb(0 0 0 / 4%);
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

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgb(0 0 0 / 45%);
      opacity: calc(1 - var(--ngp-drawer-swipe-progress));
      transition: opacity 400ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .backdrop[data-starting-style],
    .backdrop[data-ending-style] {
      opacity: 0;
    }

    .viewport {
      position: fixed;
      inset: 0;
      z-index: 1001;
      display: flex;
      justify-content: flex-end;
      touch-action: none;
    }

    .drawer {
      width: min(22rem, calc(100vw - 3rem));
      height: 100%;
      padding: 1.5rem;
      overflow-y: auto;
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

    .drawer[data-swiping],
    .backdrop[data-swiping] {
      transition-duration: 0ms;
      user-select: none;
    }

    h2 {
      margin: 0 0 0.25rem;
      font-size: 1.125rem;
      font-weight: 590;
    }

    p {
      margin: 0;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .field-list {
      display: grid;
      gap: 0.75rem;
      margin-block: 2rem;
    }

    .field-list span {
      display: block;
      height: 3rem;
      border-radius: 0.5rem;
      background: var(--ngp-background-secondary);
    }

    .actions {
      display: flex;
      justify-content: flex-end;
    }

    @media (prefers-reduced-motion: reduce) {
      .drawer,
      .backdrop {
        transition-duration: 0ms;
      }
    }
  `,
})
export default class DrawerExample {}
