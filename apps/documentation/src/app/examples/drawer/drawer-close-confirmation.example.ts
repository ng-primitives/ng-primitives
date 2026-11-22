import { A11yModule } from '@angular/cdk/a11y';
import { Component, ElementRef, signal, viewChild } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDrawerBackdrop,
  NgpDrawerClose,
  NgpDrawerContent,
  NgpDrawerOpenChangeEvent,
  NgpDrawerPopup,
  NgpDrawerPortal,
  NgpDrawer,
  NgpDrawerTitle,
  NgpDrawerTrigger,
  NgpDrawerViewport,
} from 'ng-primitives/drawer';

@Component({
  selector: 'app-drawer-close-confirmation',
  imports: [
    A11yModule,
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
  ],
  template: `
    <ng-container
      [disablePointerDismissal]="confirmationOpen()"
      [modal]="confirmationOpen() ? false : true"
      [open]="drawerOpen()"
      (beforeOpenChange)="onBeforeOpenChange($event)"
      (openChange)="drawerOpen.set($event)"
      ngpDrawer
      swipeDirection="right"
    >
      <button ngpButton ngpDrawerTrigger>Write a post</button>
      <ng-template ngpDrawerPortal>
        <div class="backdrop" ngpDrawerBackdrop></div>
        <div class="viewport" ngpDrawerViewport>
          <section class="drawer" [class.confirming]="confirmationOpen()" ngpDrawerPopup>
            <div ngpDrawerContent>
              <h2 id="drawer-post-title" ngpDrawerTitle>New post</h2>
              <form (submit)="publish(); $event.preventDefault()">
                <textarea
                  #postTextarea
                  [value]="draft()"
                  (input)="updateDraft($event)"
                  aria-labelledby="drawer-post-title"
                  placeholder="What would you like to share?"
                  required
                ></textarea>
                <div class="actions">
                  <button ngpButton ngpDrawerClose type="button">Cancel</button>
                  <button class="primary" ngpButton type="submit">Publish</button>
                </div>
              </form>
            </div>
          </section>

          @if (confirmationOpen()) {
            <section
              class="confirmation"
              [cdkTrapFocusAutoCapture]="true"
              aria-describedby="discard-description"
              aria-labelledby="discard-title"
              cdkTrapFocus
              role="alertdialog"
            >
              <div>
                <h2 id="discard-title">Discard draft?</h2>
                <p id="discard-description">Your changes will be lost.</p>
              </div>
              <div class="actions">
                <button (click)="keepEditing()" ngpButton cdkFocusInitial type="button">
                  Keep editing
                </button>
                <button class="primary" (click)="discard()" ngpButton type="button">Discard</button>
              </div>
            </section>
          }
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
      justify-content: flex-end;
      touch-action: none;
    }

    .drawer {
      position: relative;
      width: min(24rem, calc(100vw - 3rem));
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

    .drawer::after {
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: rgb(0 0 0 / 6%);
      content: '';
      opacity: 0;
      transition: opacity 100ms ease-out;
    }

    .drawer.confirming::after {
      opacity: 1;
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

    form {
      display: grid;
      gap: 1rem;
      margin-block-start: 1rem;
    }

    textarea {
      min-height: 10rem;
      padding: 0.75rem;
      resize: vertical;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border: none;
      border-radius: 0.5rem;
      box-shadow: var(--ngp-input-shadow);
      font: inherit;
      font-size: 0.875rem;
      outline: none;
      letter-spacing: -0.006em;
    }

    textarea:focus-visible {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.75rem;
    }

    .confirmation {
      position: fixed;
      inset-block-start: 50%;
      inset-inline-start: 50%;
      z-index: 2;
      display: grid;
      width: min(24rem, calc(100vw - 3rem));
      gap: 1rem;
      padding: 1rem;
      color: var(--ngp-text-primary);
      background: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      border-radius: 0.75rem;
      box-shadow: var(--ngp-shadow);
      transform: translate(-50%, -50%);
    }

    .confirmation p {
      margin-block-start: 0.25rem;
      color: var(--ngp-text-secondary);
      font-size: 0.875rem;
    }

    @media (prefers-reduced-motion: reduce) {
      .drawer,
      .drawer::after,
      .backdrop {
        transition-duration: 0ms;
      }
    }
  `,
})
export default class DrawerCloseConfirmationExample {
  readonly drawerOpen = signal(false);
  readonly confirmationOpen = signal(false);
  readonly draft = signal('');

  private readonly postTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('postTextarea');

  onBeforeOpenChange(event: NgpDrawerOpenChangeEvent): void {
    // While the alert dialog is up, Escape dismisses it rather than the drawer behind it.
    if (!event.nextOpen && this.confirmationOpen()) {
      event.cancel();
      if (event.reason === 'escape-key') {
        this.keepEditing();
      }
      return;
    }

    if (!event.nextOpen && this.draft()) {
      event.cancel();
      this.confirmationOpen.set(true);
      return;
    }

    if (!event.nextOpen) {
      this.draft.set('');
    }
  }

  updateDraft(event: Event): void {
    this.draft.set((event.target as HTMLTextAreaElement).value);
  }

  publish(): void {
    this.draft.set('');
    this.drawerOpen.set(false);
  }

  keepEditing(): void {
    this.confirmationOpen.set(false);
    requestAnimationFrame(() => this.postTextarea()?.nativeElement.focus());
  }

  discard(): void {
    this.confirmationOpen.set(false);
    this.draft.set('');
    this.drawerOpen.set(false);
  }
}
