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
  NgpDrawerSnapPoint,
  NgpDrawerTitle,
  NgpDrawerTrigger,
  NgpDrawerViewport,
} from 'ng-primitives/drawer';

@Component({
  selector: 'app-drawer-snap-points',
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
    <ng-container [snapPoints]="snapPoints" defaultSnapPoint="31rem" ngpDrawer>
      <button ngpButton ngpDrawerTrigger>Open snap drawer</button>
      <ng-template ngpDrawerPortal>
        <div class="backdrop" ngpDrawerBackdrop></div>
        <div class="viewport" ngpDrawerViewport>
          <section class="sheet" ngpDrawerPopup>
            <header>
              <div class="handle" aria-hidden="true"></div>
              <h2 ngpDrawerTitle>Snap points</h2>
            </header>
            <div ngpDrawerContent>
              <p ngpDrawerDescription>
                Drag between a compact preview and a nearly full-height drawer.
              </p>
              <div class="cards" aria-hidden="true">
                @for (card of cards; track card) {
                  <span></span>
                }
              </div>
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

    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgb(0 0 0 / 45%);
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
      display: flex;
      flex-direction: column;
      width: 100%;
      max-height: calc(100dvh - 1rem);
      padding-bottom: max(
        0px,
        calc(var(--ngp-drawer-snap-point-offset) + var(--ngp-drawer-swipe-movement-y))
      );
      overflow: hidden;
      touch-action: none;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border-block-start: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow);
      outline: none;
      transform: translateY(
        calc(var(--ngp-drawer-snap-point-offset) + var(--ngp-drawer-swipe-movement-y))
      );
      transition: transform 400ms cubic-bezier(0.32, 0.72, 0, 1);
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

    header {
      flex: none;
      padding: 0.875rem 1.5rem;
      border-block-end: 1px solid var(--ngp-border);
      text-align: center;
    }

    .handle {
      width: 3rem;
      height: 0.25rem;
      margin: 0 auto 0.75rem;
      border-radius: 999px;
      background: var(--ngp-border);
    }

    h2,
    p {
      margin: 0;
    }

    h2 {
      font-size: 1.125rem;
    }

    [ngpDrawerContent] {
      width: min(100%, 32rem);
      margin-inline: auto;
      padding: 1rem 1.5rem max(1.5rem, env(safe-area-inset-bottom));
      overflow-y: auto;
      touch-action: auto;
      text-align: center;
    }

    p {
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .cards {
      display: grid;
      gap: 0.75rem;
      margin-block: 1.25rem;
    }

    .cards span {
      display: block;
      height: 3rem;
      border-radius: 0.5rem;
      background: var(--ngp-background-secondary);
    }
  `,
})
export default class DrawerSnapPointsExample {
  readonly snapPoints: readonly NgpDrawerSnapPoint[] = ['31rem', 1];
  readonly cards = Array.from({ length: 12 }, (_, index) => index);
}
