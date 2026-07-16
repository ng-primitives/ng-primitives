import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDrawerBackdrop,
  NgpDrawerClose,
  NgpDrawerContent,
  NgpDrawerPopup,
  NgpDrawerPortal,
  NgpDrawerRoot,
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
    NgpDrawerRoot,
    NgpDrawerTitle,
    NgpDrawerTrigger,
    NgpDrawerViewport,
    NgpDrawerVirtualKeyboard,
  ],
  template: `
    <ng-container ngpDrawerRoot>
      <button ngpButton ngpDrawerTrigger>Open delivery form</button>
      <ng-container ngpDrawerVirtualKeyboard>
        <ng-template ngpDrawerPortal>
          <div class="backdrop" ngpDrawerBackdrop></div>
          <div class="viewport" ngpDrawerViewport>
            <section class="sheet" ngpDrawerPopup>
              <header>
                <button ngpButton ngpDrawerClose>Cancel</button>
                <h2 ngpDrawerTitle>Delivery details</h2>
                <button ngpButton ngpDrawerClose>Save</button>
              </header>
              <div class="content" ngpDrawerContent>
                @for (field of fields; track field.label) {
                  <label>
                    {{ field.label }}
                    <input [placeholder]="field.placeholder" />
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
      display: grid;
      flex: none;
      grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-block-end: 1px solid var(--ngp-border);
    }

    header [ngpButton]:last-child {
      justify-self: end;
    }

    h2 {
      margin: 0;
      font-size: 1rem;
      text-align: center;
    }

    .content {
      display: grid;
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
      gap: 0.375rem;
      color: var(--ngp-text-secondary);
      font-size: 0.8125rem;
      font-weight: 590;
    }

    input,
    textarea {
      width: 100%;
      padding: 0.625rem 0.75rem;
      resize: vertical;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.5rem;
      font: inherit;
      font-size: max(1rem, 16px);
      font-weight: 400;
      outline: none;
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
  `,
})
export default class DrawerVirtualKeyboardAwareExample {
  readonly fields = [
    { label: 'Name', placeholder: 'Ada Lovelace' },
    { label: 'Phone', placeholder: '+1 (555) 123-4567' },
    { label: 'Street address', placeholder: '12 Computing Way' },
    { label: 'City', placeholder: 'San Francisco' },
    { label: 'Postal code', placeholder: '94107' },
  ] as const;
}
