import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDrawerBackdrop,
  NgpDrawerClose,
  NgpDrawerContent,
  NgpDrawerDescription,
  NgpDrawerIndent,
  NgpDrawerIndentBackground,
  NgpDrawerPopup,
  NgpDrawerPortal,
  NgpDrawerProvider,
  NgpDrawer,
  NgpDrawerTitle,
  NgpDrawerTrigger,
  NgpDrawerViewport,
} from 'ng-primitives/drawer';

@Component({
  selector: 'app-drawer-indent-provider',
  imports: [
    NgpButton,
    NgpDrawerBackdrop,
    NgpDrawerClose,
    NgpDrawerContent,
    NgpDrawerDescription,
    NgpDrawerIndent,
    NgpDrawerIndentBackground,
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawerProvider,
    NgpDrawer,
    NgpDrawerTitle,
    NgpDrawerTrigger,
    NgpDrawerViewport,
  ],
  template: `
    <ng-container ngpDrawerProvider>
      <div class="stage" #portalContainer>
        <div class="indent-background" ngpDrawerIndentBackground></div>
        <div class="page" ngpDrawerIndent>
          <ng-container [modal]="false" ngpDrawer>
            <button ngpButton ngpDrawerTrigger>Open contained drawer</button>
            <ng-template [container]="portalContainer" ngpDrawerPortal>
              <div class="backdrop" ngpDrawerBackdrop></div>
              <div class="viewport" ngpDrawerViewport>
                <section class="sheet" ngpDrawerPopup>
                  <div class="handle" aria-hidden="true"></div>
                  <div ngpDrawerContent>
                    <h2 ngpDrawerTitle>Notifications</h2>
                    <p ngpDrawerDescription>
                      The surrounding page indents while this contained drawer is open.
                    </p>
                    <button ngpButton ngpDrawerClose>Close</button>
                  </div>
                </section>
              </div>
            </ng-template>
          </ng-container>
        </div>
      </div>
    </ng-container>
  `,
  styles: `
    :host {
      display: block;
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

    .stage {
      position: relative;
      width: 100%;
      min-height: 20rem;
      overflow: hidden;
      border: 1px solid var(--ngp-border);
      border-radius: 0.75rem;
      background: var(--ngp-text-primary);
    }

    .indent-background {
      position: absolute;
      inset: 0;
      background: var(--ngp-text-primary);
    }

    .page {
      position: relative;
      display: grid;
      min-height: 20rem;
      place-items: center;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      transform-origin: center top;
      transition:
        transform 400ms cubic-bezier(0.32, 0.72, 0, 1),
        border-radius 250ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .page[data-active] {
      border-start-start-radius: calc(1rem * (1 - var(--ngp-drawer-swipe-progress)));
      border-start-end-radius: calc(1rem * (1 - var(--ngp-drawer-swipe-progress)));
      transform: translateY(calc(0.5rem * (1 - var(--ngp-drawer-swipe-progress))))
        scale(calc(0.98 + (0.02 * var(--ngp-drawer-swipe-progress))));
    }

    .backdrop,
    .viewport {
      position: absolute;
      inset: 0;
    }

    .backdrop {
      background: rgb(0 0 0 / 40%);
      opacity: calc(1 - var(--ngp-drawer-swipe-progress));
      transition: opacity 400ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .viewport {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      touch-action: none;
    }

    .sheet {
      width: 100%;
      max-height: 16rem;
      padding: 0.875rem 1.5rem 1.5rem;
      overflow-y: auto;
      touch-action: auto;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border-block-start: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow);
      outline: none;
      transform: translateY(var(--ngp-drawer-swipe-movement-y));
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
      max-width: 30rem;
      margin-inline: auto;
      text-align: center;
    }

    h2,
    p {
      margin: 0;
    }

    h2 {
      font-size: 1.125rem;
    }

    p {
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
    }
  `,
})
export default class DrawerIndentProviderExample {}
