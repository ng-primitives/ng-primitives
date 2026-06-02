import { Component } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';

@Component({
  selector: 'app-dialog-drawer',
  imports: [
    NgpButton,
    NgpDialog,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    NgpDialogTrigger,
  ],
  template: `
    <button [ngpDialogTrigger]="drawer" ngpButton>Launch Drawer</button>

    <ng-template #drawer let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog>
          <h1 ngpDialogTitle>Settings</h1>
          <p ngpDialogDescription>Change your preferences or manage your account in this drawer.</p>
          <div class="drawer-footer">
            <button (click)="close()" ngpButton>Cancel</button>
            <button (click)="close()" ngpButton>Save</button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    button {
      padding-inline: 0.875rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      border: none;
      outline: none;
      height: 2.125rem;
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      background-color: var(--ngp-background);
      transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 1px 2px 0 rgba(0, 0, 0, 0.04);
    }

    button[data-hover] {
      background-color: var(--ngp-background-hover);
    }

    button[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    button[data-press] {
      background-color: var(--ngp-background-active);
    }

    [ngpDialogOverlay] {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      justify-content: flex-end;
      align-items: stretch;
      animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialogOverlay][data-exit] {
      animation: fadeOut 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialog] {
      background-color: var(--ngp-background);
      padding: 24px;
      width: 320px;
      max-width: 100%;
      height: 100%;
      box-shadow: var(--ngp-shadow);
      animation: drawerSlideIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialog][data-exit] {
      animation: drawerSlideOut 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialogTitle] {
      font-size: 18px;
      line-height: 28px;
      font-weight: 590;
      color: var(--ngp-text-primary);
      margin: 0 0 4px;
    }

    [ngpDialogDescription] {
      font-size: 14px;
      line-height: 20px;
      color: var(--ngp-text-secondary);
      margin: 0;
    }

    .drawer-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 32px;
      column-gap: 8px;
    }

    .drawer-footer [ngpButton]:last-of-type {
      background-color: var(--ngp-primary);
      color: var(--ngp-primary-text);
      box-shadow:
        inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
        0 1px 2px 0 rgba(0, 0, 0, 0.08);
    }

    .drawer-footer [ngpButton]:last-of-type[data-hover] {
      background-color: var(--ngp-primary-hover);
    }

    @keyframes fadeIn {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    @keyframes drawerSlideIn {
      0% {
        transform: translateX(100%);
        opacity: 0;
      }
      100% {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes drawerSlideOut {
      0% {
        transform: translateX(0);
        opacity: 1;
      }
      100% {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `,
})
export default class DialogDrawerExample {}
