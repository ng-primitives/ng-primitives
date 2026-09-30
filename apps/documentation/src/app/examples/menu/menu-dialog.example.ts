import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import { NgpMenu, NgpMenuItem, NgpMenuTrigger } from 'ng-primitives/menu';

@Component({
  selector: 'app-menu-dialog',
  imports: [
    NgpButton,
    NgpMenu,
    NgpMenuTrigger,
    NgpMenuItem,
    NgpDialog,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    NgpDialogTrigger,
  ],
  template: `
    <button [ngpMenuTrigger]="menu" ngpButton>Open Menu</button>

    <ng-template #menu>
      <div ngpMenu>
        <button ngpMenuItem>Rename</button>
        <button ngpMenuItem>Duplicate</button>
        <button [ngpDialogTrigger]="confirm" [ngpMenuItemCloseOnSelect]="false" ngpMenuItem>
          Delete...
        </button>
      </div>
    </ng-template>

    <ng-template #confirm let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog>
          <h1 ngpDialogTitle>Delete this file?</h1>
          <p ngpDialogDescription>
            The file and its revision history are removed for everyone. This cannot be undone.
          </p>
          <div class="dialog-footer">
            <button (click)="close()" ngpButton type="button">Cancel</button>
            <button class="delete" (click)="close()" ngpButton type="button">Delete</button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    [ngpButton] {
      display: inline-flex;
      align-items: center;
      height: 2.125rem;
      padding-inline: 0.875rem;
      border: none;
      border-radius: 0.5rem;
      outline: none;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      background-color: var(--ngp-background);
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 1px 2px 0 rgba(0, 0, 0, 0.04);
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpButton][data-hover] {
      background-color: var(--ngp-background-hover);
    }

    [ngpButton][data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpButton][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpButton].delete {
      color: var(--ngp-primary-text);
      background-color: var(--ngp-primary);
      box-shadow: none;
    }

    [ngpButton].delete[data-hover] {
      background-color: var(--ngp-primary-hover);
    }

    [ngpButton].delete[data-press] {
      background-color: var(--ngp-primary-active);
    }

    [ngpMenu] {
      /* Same layer as the dialog overlay: both portal into <body>, so whichever opened
         last is last in the DOM and paints on top. */
      position: fixed;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      width: max-content;
      padding: 0.25rem;
      border: 1px solid var(--ngp-border);
      border-radius: 0.625rem;
      outline: none;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-shadow-lg);
      transform-origin: var(--ngp-menu-transform-origin);
    }

    [ngpMenu][data-enter] {
      animation: menu-show 100ms ease-out;
    }

    [ngpMenu][data-exit] {
      animation: menu-hide 100ms ease-out;
    }

    [ngpMenuItem] {
      min-width: 160px;
      padding: 0.4375rem 0.75rem;
      border: none;
      border-radius: 0.375rem;
      outline: none;
      background: none;
      cursor: pointer;
      text-align: start;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpMenuItem][data-hover],
    [ngpMenuItem][data-focus-visible] {
      background-color: var(--ngp-background-hover);
    }

    [ngpMenuItem][data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpDialogOverlay] {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      animation: fade-in 150ms cubic-bezier(0, 0, 0.2, 1);
    }

    [ngpDialogOverlay][data-exit] {
      animation: fade-out 150ms cubic-bezier(0.4, 0, 1, 1);
    }

    [ngpDialog] {
      width: min(24rem, calc(100vw - 2rem));
      padding: 24px;
      border: 1px solid var(--ngp-border);
      border-radius: 0.875rem;
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-shadow-lg);
      animation: slide-in 150ms cubic-bezier(0, 0, 0.2, 1);
    }

    [ngpDialog][data-exit] {
      animation: slide-out 150ms cubic-bezier(0.4, 0, 1, 1);
    }

    [ngpDialogTitle] {
      margin: 0 0 4px;
      font-size: 1.125rem;
      line-height: 1.75rem;
      font-weight: 590;
      letter-spacing: -0.014em;
      color: var(--ngp-text-primary);
    }

    [ngpDialogDescription] {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.25rem;
      letter-spacing: -0.006em;
      color: var(--ngp-text-secondary);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      column-gap: 8px;
      margin-top: 24px;
    }

    @keyframes menu-show {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes menu-hide {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.95);
      }
    }

    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes fade-out {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slide-out {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-8px);
      }
    }
  `,
})
export default class MenuDialogExample {}
