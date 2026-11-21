import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDrawerBackdrop,
  NgpDrawerClose,
  NgpDrawerContent,
  NgpDrawerPopup,
  NgpDrawerPortal,
  NgpDrawer,
  NgpDrawerTitle,
  NgpDrawerTrigger,
  NgpDrawerViewport,
  NgpDrawerVirtualKeyboard,
} from 'ng-primitives/drawer';

@Component({
  selector: 'app-drawer-virtual-keyboard-aware',
  imports: [
    NgpButton,
    NgpDrawerBackdrop,
    NgpDrawerClose,
    NgpDrawerContent,
    NgpDrawerPopup,
    NgpDrawerPortal,
    NgpDrawer,
    NgpDrawerTitle,
    NgpDrawerTrigger,
    NgpDrawerViewport,
    NgpDrawerVirtualKeyboard,
  ],
  template: `
    <ng-container ngpDrawer>
      <button ngpButton ngpDrawerTrigger>Open delivery form</button>
      <ng-container ngpDrawerVirtualKeyboard>
        <ng-template ngpDrawerPortal>
          <div class="backdrop" ngpDrawerBackdrop></div>
          <div class="viewport" ngpDrawerViewport>
            <section class="sheet" ngpDrawerPopup>
              <header>
                <button ngpButton ngpDrawerClose>Cancel</button>
                <h2 ngpDrawerTitle>Delivery details</h2>
                <button class="primary" ngpButton ngpDrawerClose>Save</button>
              </header>
              <div class="content" ngpDrawerContent>
                @for (field of fields; track field.label) {
                  <label>
                    {{ field.label }}
                    <input [type]="field.type" [placeholder]="field.placeholder" />
                  </label>
                }
                <label>
                  Instructions
                  <textarea placeholder="Gate code or drop-off instructions" rows="3"></textarea>
                </label>
              </div>
              <footer>
                <label>
                  Delivery note
                  <input placeholder="Add a note for the driver" />
                </label>
              </footer>
            </section>
          </div>
        </ng-template>
      </ng-container>
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

    [ngpButton].primary {
      color: var(--ngp-primary-text);
      background: var(--ngp-primary);
      box-shadow:
        inset 0 1px 0 0 rgb(255 255 255 / 20%),
        0 1px 2px 0 rgb(0 0 0 / 8%);
    }

    [ngpButton].primary[data-hover] {
      background: var(--ngp-primary-hover);
    }

    [ngpButton].primary[data-press] {
      background: var(--ngp-primary-active);
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
      display: flex;
      width: 100%;
      height: calc(100dvh - 1rem);
      max-height: calc(100dvh - 1rem);
      flex-direction: column;
      overflow: hidden;
      touch-action: none;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border-block-start: 1px solid var(--ngp-border);
      border-radius: 0.75rem 0.75rem 0 0;
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

    header {
      display: grid;
      flex: none;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-block-end: 1px solid var(--ngp-border);
    }

    header [ngpButton]:first-child {
      justify-self: start;
    }

    header [ngpButton]:last-child {
      justify-self: end;
    }

    h2 {
      margin: 0;
      font-size: 1rem;
      text-align: center;
      color: var(--ngp-text-primary);
      font-weight: 590;
      letter-spacing: -0.014em;
    }

    .content {
      display: grid;
      align-content: start;
      width: min(100%, 32rem);
      min-height: 0;
      flex: 1;
      gap: 0.875rem;
      margin-inline: auto;
      padding: 1.25rem 1.5rem;
      overflow-y: auto;
      touch-action: auto;
    }

    label {
      display: grid;
      align-content: start;
      gap: 0.375rem;
      color: var(--ngp-text-secondary);
      font-size: 0.8125rem;
      font-weight: 590;
      letter-spacing: -0.014em;
    }

    input,
    textarea {
      width: 100%;
      padding: 0.5rem 0.75rem;
      resize: vertical;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border: none;
      border-radius: 0.5rem;
      box-shadow: var(--ngp-input-shadow);
      font: inherit;
      font-size: max(0.875rem, 16px);
      font-weight: 400;
      outline: none;
      letter-spacing: -0.006em;
    }

    input {
      height: 2.375rem;
    }

    input:focus-visible,
    textarea:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    footer {
      flex: none;
      min-height: calc(4.75rem + var(--ngp-drawer-keyboard-inset, 0px));
      padding: 0.75rem 1.5rem
        calc(0.75rem + env(safe-area-inset-bottom) + var(--ngp-drawer-keyboard-inset, 0px));
      background: var(--ngp-background);
      border-block-start: 1px solid var(--ngp-border);
      transition:
        min-height 260ms cubic-bezier(0.32, 0.72, 0, 1),
        padding-bottom 260ms cubic-bezier(0.32, 0.72, 0, 1);
    }

    footer label {
      width: min(100%, 32rem);
      margin-inline: auto;
    }

    @media (prefers-reduced-motion: reduce) {
      .sheet,
      .backdrop,
      footer {
        transition-duration: 0ms;
      }
    }
  `,
})
export default class DrawerVirtualKeyboardAwareExample {
  readonly fields = [
    { label: 'Name', type: 'text', placeholder: 'Ada Lovelace' },
    { label: 'Phone', type: 'tel', placeholder: '+1 (555) 123-4567' },
    { label: 'Street address', type: 'text', placeholder: '12 Computing Way' },
    { label: 'City', type: 'text', placeholder: 'San Francisco' },
    { label: 'Postal code', type: 'text', placeholder: '94107' },
  ] as const;
}
