import { Component, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogManager,
  NgpDialogOverlay,
  NgpDialogTitle,
} from 'ng-primitives/dialog';
import { NgpPopover, NgpPopoverTrigger } from 'ng-primitives/popover';

@Component({
  selector: 'app-popover-confirmation',
  imports: [
    FormsModule,
    NgpPopoverTrigger,
    NgpPopover,
    NgpButton,
    NgpDialogOverlay,
    NgpDialog,
    NgpDialogTitle,
    NgpDialogDescription,
  ],
  template: `
    <button #trigger="ngpPopoverTrigger" [ngpPopoverTrigger]="popover" ngpButton>
      Edit Profile
    </button>

    <ng-template #popover>
      <div ngpPopover>
        <p class="popover-title">Edit Profile</p>
        <label>
          Name
          <input [(ngModel)]="name" type="text" />
        </label>
        <div class="popover-footer">
          <button (click)="openConfirmation()" ngpButton>Delete Account</button>
        </div>
      </div>
    </ng-template>

    <ng-template #confirmDialog let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog>
          <h1 ngpDialogTitle>Delete Account?</h1>
          <p ngpDialogDescription>
            This will permanently delete your account. This action cannot be undone.
          </p>
          <div class="dialog-footer">
            <button (click)="close()" ngpButton>Cancel</button>
            <button class="destructive" (click)="confirmDelete(close)" ngpButton>Delete</button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    button[ngpButton] {
      padding-left: 1rem;
      padding-right: 1rem;
      border-radius: 0.5rem;
      color: var(--ngp-text-primary);
      border: none;
      outline: none;
      height: 2.5rem;
      font-weight: 500;
      background-color: var(--ngp-background);
      transition: background-color 300ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--ngp-button-shadow);
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

    [ngpPopover] {
      background-color: var(--ngp-background);
      border: 1px solid var(--ngp-border);
      padding: 1rem;
      border-radius: 0.75rem;
      outline: none;
      position: absolute;
      animation: popover-show 0.1s ease-out;
      box-shadow: var(--ngp-shadow-lg);
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 260px;
    }

    .popover-title {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--ngp-text-primary);
      margin: 0;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
    }

    input {
      height: 2rem;
      border-radius: 0.375rem;
      border: 1px solid var(--ngp-border);
      padding: 0 0.5rem;
      font-size: 0.875rem;
      outline: none;
      background-color: transparent;
      color: var(--ngp-text-primary);
    }

    input:focus {
      border-color: var(--ngp-focus-ring);
    }

    .popover-footer {
      display: flex;
      justify-content: flex-end;
      padding-top: 0.25rem;
    }

    .popover-footer button {
      color: var(--ngp-text-red);
      font-size: 0.875rem;
      height: 2rem;
    }

    [ngpDialogOverlay] {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1001;
    }

    [ngpDialogOverlay][data-exit] {
      animation: fadeOut 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialog] {
      background-color: var(--ngp-background);
      padding: 24px;
      border-radius: 8px;
      box-shadow: var(--ngp-shadow);
      animation: slideIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialog][data-exit] {
      animation: slideOut 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialogTitle] {
      font-size: 18px;
      line-height: 28px;
      font-weight: 600;
      color: var(--ngp-text-primary);
      margin: 0 0 4px;
    }

    [ngpDialogDescription] {
      font-size: 14px;
      line-height: 20px;
      color: var(--ngp-text-secondary);
      margin: 0;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
      column-gap: 8px;
    }

    .destructive {
      color: var(--ngp-text-red) !important;
    }

    @keyframes popover-show {
      0% {
        opacity: 0;
        transform: translateY(-10px) scale(0.9);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
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

    @keyframes slideIn {
      0% {
        transform: translateY(-20px);
        opacity: 0;
      }
      100% {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      0% {
        transform: translateY(0);
        opacity: 1;
      }
      100% {
        transform: translateY(-20px);
        opacity: 0;
      }
    }
  `,
})
export default class PopoverConfirmationExample {
  private readonly dialogManager = inject(NgpDialogManager);

  readonly confirmDialog = viewChild.required<TemplateRef<any>>('confirmDialog');
  readonly trigger = viewChild.required(NgpPopoverTrigger);

  readonly name = signal('John Doe');

  openConfirmation(): void {
    this.dialogManager.open(this.confirmDialog());
  }

  confirmDelete(close: () => void): void {
    close();
    this.trigger().hide();
  }
}
