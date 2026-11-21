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
  NgpDrawerSwipeArea,
  NgpDrawerTitle,
  NgpDrawerTrigger,
  NgpDrawerViewport,
} from 'ng-primitives/drawer';

@Component({
  selector: 'app-drawer-swipe-area',
  imports: [
    NgpButton,
    NgpDrawerBackdrop,
    NgpDrawerClose,
    NgpDrawerContent,
    NgpDrawerDescription,
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawer,
    NgpDrawerSwipeArea,
    NgpDrawerTitle,
    NgpDrawerTrigger,
    NgpDrawerViewport,
  ],
  template: `
    <div class="stage" #portalContainer>
      <ng-container [modal]="false" ngpDrawer swipeDirection="right">
        <div class="swipe-area" ngpDrawerSwipeArea>
          <span>Swipe here</span>
        </div>
        <div class="intro">
          <p>Swipe from the right edge to open the drawer.</p>
          <!-- The swipe area only responds to pointers, so keyboard users need a trigger too. -->
          <button ngpButton ngpDrawerTrigger>Open library</button>
        </div>

        <ng-template [container]="portalContainer" ngpDrawerPortal>
          <div class="backdrop" ngpDrawerBackdrop></div>
          <div class="viewport" ngpDrawerViewport>
            <aside class="drawer" ngpDrawerPopup>
              <div ngpDrawerContent>
                <h2 ngpDrawerTitle>Library</h2>
                <p ngpDrawerDescription>
                  An edge swipe area adds a gesture for opening the drawer next to its trigger.
                </p>
                <button ngpButton ngpDrawerClose>Close</button>
              </div>
            </aside>
          </div>
        </ng-template>
      </ng-container>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .stage {
      position: relative;
      /* Flex rather than grid: the drawer portal appends its host here, and a grid would give it a
         row of its own and shift the centred text when the drawer opens. */
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 20rem;
      overflow: hidden;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.75rem;
    }

    .intro {
      display: grid;
      justify-items: center;
      gap: 0.75rem;
    }

    .intro p {
      max-width: 14rem;
      margin: 0;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      text-align: center;
      letter-spacing: -0.006em;
    }

    .swipe-area {
      position: absolute;
      inset-block: 0;
      inset-inline-end: 0;
      z-index: 2;
      width: 2.5rem;
      border-inline-start: 1px dashed var(--ngp-border-secondary);
      background: var(--ngp-background-hover);
      color: var(--ngp-text-tertiary);
      touch-action: none;
    }

    .swipe-area span {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-end: -1.5rem;
      width: 5rem;
      transform: translateY(-50%) rotate(-90deg);
      font-size: 0.75rem;
      font-weight: 510;
      letter-spacing: -0.011em;
      text-align: center;
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

    .backdrop,
    .viewport {
      position: absolute;
      inset: 0;
    }

    .backdrop {
      background: var(--ngp-backdrop);
      opacity: calc(1 - var(--ngp-drawer-swipe-progress));
      transition: opacity 450ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .viewport {
      z-index: 3;
      display: flex;
      justify-content: flex-end;
      touch-action: none;
    }

    .drawer {
      width: min(20rem, calc(100% - 2rem));
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
      transition: transform 450ms cubic-bezier(0.32, 0.72, 0, 1);
      will-change: transform;
    }

    .drawer[data-starting-style],
    .drawer[data-ending-style] {
      transform: translateX(calc(100% + 2px));
    }

    .backdrop[data-starting-style],
    .backdrop[data-ending-style] {
      opacity: 0;
    }

    [data-swiping] {
      transition-duration: 0ms;
      user-select: none;
    }

    h2 {
      margin: 0 0 0.25rem;
      font-size: 1.125rem;
      color: var(--ngp-text-primary);
      font-weight: 590;
      letter-spacing: -0.014em;
    }

    [ngpDrawerContent] p {
      margin: 0 0 1.5rem;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      letter-spacing: -0.006em;
    }

    @media (prefers-reduced-motion: reduce) {
      .drawer,
      .backdrop {
        transition-duration: 0ms;
      }
    }
  `,
})
export default class DrawerSwipeAreaExample {}
