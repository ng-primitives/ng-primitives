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
  selector: 'app-drawer-nested',
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
    <ng-container ngpDrawerRoot>
      <button ngpButton ngpDrawerTrigger>Open drawer stack</button>
      <ng-template ngpDrawerPortal>
        <div class="backdrop" ngpDrawerBackdrop></div>
        <div class="viewport" ngpDrawerViewport>
          <section class="sheet" ngpDrawerPopup>
            <div class="handle" aria-hidden="true"></div>
            <div ngpDrawerContent>
              <h2 ngpDrawerTitle>Account</h2>
              <p ngpDrawerDescription>
                Each nested drawer keeps independent focus and dismissal behavior.
              </p>
              <div class="actions">
                <ng-container ngpDrawerRoot>
                  <button ngpButton ngpDrawerTrigger>Security settings</button>
                  <ng-template ngpDrawerPortal>
                    <div class="viewport" ngpDrawerViewport>
                      <section class="sheet" ngpDrawerPopup>
                        <div class="handle" aria-hidden="true"></div>
                        <div ngpDrawerContent>
                          <h2 ngpDrawerTitle>Security</h2>
                          <p ngpDrawerDescription>
                            Review passkeys, two-factor authentication, and signed-in devices.
                          </p>
                          <ul>
                            <li>Passkeys enabled</li>
                            <li>Authenticator app connected</li>
                            <li>Three signed-in devices</li>
                          </ul>
                          <div class="actions">
                            <ng-container ngpDrawerRoot>
                              <button ngpButton ngpDrawerTrigger>Advanced options</button>
                              <ng-template ngpDrawerPortal>
                                <div class="viewport" ngpDrawerViewport>
                                  <section class="sheet sheet-tall" ngpDrawerPopup>
                                    <div class="handle" aria-hidden="true"></div>
                                    <div ngpDrawerContent>
                                      <h2 ngpDrawerTitle>Advanced</h2>
                                      <p ngpDrawerDescription>
                                        Variable-height drawers can participate in the same stack.
                                      </p>
                                      <label>
                                        Device name
                                        <input value="Personal laptop" />
                                      </label>
                                      <label>
                                        Notes
                                        <textarea rows="3">Rotate recovery codes.</textarea>
                                      </label>
                                      <button ngpButton ngpDrawerClose>Done</button>
                                    </div>
                                  </section>
                                </div>
                              </ng-template>
                            </ng-container>
                            <button ngpButton ngpDrawerClose>Close</button>
                          </div>
                        </div>
                      </section>
                    </div>
                  </ng-template>
                </ng-container>
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
      align-items: flex-end;
      justify-content: center;
      touch-action: none;
    }

    .sheet {
      --stack-progress: clamp(0, var(--ngp-drawer-swipe-progress), 1);
      --stack-step: 0.04;
      --stack-scale: calc(
        1 - (var(--ngp-drawer-nested-drawers, 0) * var(--stack-step)) +
          (var(--stack-progress) * var(--stack-step))
      );
      width: 100%;
      height: var(--ngp-drawer-height, auto);
      max-height: 80dvh;
      padding: 0.875rem 1.5rem max(1.5rem, env(safe-area-inset-bottom));
      overflow-y: auto;
      touch-action: auto;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-block-end: 0;
      border-radius: 0.75rem 0.75rem 0 0;
      box-shadow: var(--ngp-shadow);
      outline: none;
      transform: translateY(
          calc(var(--ngp-drawer-swipe-movement-y) - (var(--ngp-drawer-nested-drawers, 0) * 0.75rem))
        )
        scale(var(--stack-scale));
      transform-origin: center bottom;
      transition:
        transform 400ms cubic-bezier(0.32, 0.72, 0, 1),
        height 400ms cubic-bezier(0.32, 0.72, 0, 1),
        opacity 400ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    .sheet[data-starting-style],
    .sheet[data-ending-style] {
      transform: translateY(calc(100% + 2px));
    }

    .sheet[data-nested-drawer-open] {
      overflow: hidden;
      opacity: 0.92;
    }

    .sheet[data-swiping],
    .sheet[data-nested-drawer-swiping] {
      transition-duration: 0ms;
      user-select: none;
    }

    .sheet-tall {
      min-height: 28rem;
    }

    .handle {
      width: 3rem;
      height: 0.25rem;
      margin: 0 auto 1rem;
      border-radius: 999px;
      background: var(--ngp-border);
    }

    [ngpDrawerContent] {
      width: min(100%, 32rem);
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
      margin-block-start: 0.25rem;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }

    ul {
      display: grid;
      gap: 0.5rem;
      margin-block: 1.25rem;
      padding: 0;
      list-style: none;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.75rem;
      margin-block-start: 1.5rem;
    }

    label {
      display: grid;
      gap: 0.375rem;
      margin-block-start: 1rem;
      color: var(--ngp-text-secondary);
      font-size: 0.8125rem;
      font-weight: 590;
      text-align: start;
    }

    input,
    textarea {
      width: 100%;
      padding: 0.625rem;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.5rem;
      font: inherit;
      font-weight: 400;
    }
  `,
})
export default class DrawerNestedExample {}
