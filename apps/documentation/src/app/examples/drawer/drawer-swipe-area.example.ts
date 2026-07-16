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
  NgpDrawerSwipeArea,
  NgpDrawerTitle,
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
    NgpDrawerRoot,
    NgpDrawerSwipeArea,
    NgpDrawerTitle,
    NgpDrawerViewport,
  ],
  template: `
    <div class="stage" #portalContainer>
      <ng-container [modal]="false" ngpDrawerRoot swipeDirection="right">
        <div class="swipe-area" ngpDrawerSwipeArea>
          <span>Swipe here</span>
        </div>
        <p>Swipe from the right edge to open the drawer.</p>

        <ng-template [container]="portalContainer" ngpDrawerPortal>
          <div class="backdrop" ngpDrawerBackdrop></div>
          <div class="viewport" ngpDrawerViewport>
            <aside class="drawer" ngpDrawerPopup>
              <div ngpDrawerContent>
                <h2 ngpDrawerTitle>Library</h2>
                <p ngpDrawerDescription>
                  Edge swipe areas can open a drawer without a visible trigger.
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
      display: grid;
      min-height: 20rem;
      overflow: hidden;
      place-items: center;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.75rem;
    }

    .stage > p {
      max-width: 14rem;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      text-align: center;
    }

    .swipe-area {
      position: absolute;
      inset-block: 0;
      inset-inline-end: 0;
      z-index: 2;
      width: 2.5rem;
      border-inline-start: 2px dashed var(--ngp-primary);
      background: color-mix(in srgb, var(--ngp-primary) 10%, transparent);
      color: var(--ngp-primary);
      touch-action: none;
    }

    .swipe-area span {
      position: absolute;
      inset-block-start: 50%;
      inset-inline-end: -1.5rem;
      width: 5rem;
      transform: translateY(-50%) rotate(-90deg);
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
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

    .backdrop,
    .viewport {
      position: absolute;
      inset: 0;
    }

    .backdrop {
      background: rgb(0 0 0 / 35%);
      opacity: calc(1 - var(--ngp-drawer-swipe-progress));
      transition: opacity 400ms cubic-bezier(0.32, 0.72, 0, 1);
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
      transition: transform 400ms cubic-bezier(0.32, 0.72, 0, 1);
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
    }

    [ngpDrawerContent] p {
      margin: 0 0 1.5rem;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }
  `,
})
export default class DrawerSwipeAreaExample {}
