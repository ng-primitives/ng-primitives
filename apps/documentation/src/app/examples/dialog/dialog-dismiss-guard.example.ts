import { Component, signal } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';

@Component({
  selector: 'app-dialog-dismiss-guard',
  imports: [
    NgpButton,
    NgpDialog,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    NgpDialogTrigger,
  ],
  template: `
    <button
      [ngpDialogTrigger]="dialog"
      [ngpDialogTriggerCloseOnEscape]="canDismiss"
      [ngpDialogTriggerCloseOnOutsideClick]="canDismiss"
      ngpButton
    >
      Edit Profile
    </button>

    <ng-template #dialog let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog>
          <h1 ngpDialogTitle>Edit Profile</h1>
          <p ngpDialogDescription>Make changes to your profile. Unsaved changes will be lost.</p>

          <div class="form-field">
            <label for="name">Name</label>
            <input
              id="name"
              (input)="dirty.set(true)"
              type="text"
              value="John Doe"
              placeholder="Enter your name"
            />
          </div>

          <div class="dialog-footer">
            <button (click)="discard(close)" ngpButton>Discard</button>
            <button (click)="save(close)" ngpButton>Save Changes</button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    button {
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

    [ngpDialogOverlay] {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      position: fixed;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialogOverlay][data-exit] {
      animation: fadeOut 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpDialog] {
      background-color: var(--ngp-background);
      padding: 24px;
      border-radius: 8px;
      box-shadow: var(--ngp-shadow);
      min-width: 340px;
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

    .form-field {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .form-field label {
      font-size: 14px;
      font-weight: 500;
      color: var(--ngp-text-primary);
    }

    .form-field input {
      height: 2.25rem;
      padding: 0 0.75rem;
      border-radius: 0.375rem;
      border: 1px solid var(--ngp-border);
      background-color: var(--ngp-background);
      color: var(--ngp-text-primary);
      font-size: 14px;
      outline: none;
    }

    .form-field input:focus {
      border-color: var(--ngp-focus-ring);
      box-shadow: 0 0 0 1px var(--ngp-focus-ring);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
      column-gap: 8px;
    }

    .dialog-footer [ngpButton]:last-of-type {
      color: var(--ngp-text-blue);
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
export default class DialogDismissGuardExample {
  readonly dirty = signal(false);

  readonly canDismiss = () => {
    if (!this.dirty()) {
      return true;
    }
    return confirm('You have unsaved changes. Discard them?');
  };

  discard(close: () => void) {
    this.dirty.set(false);
    close();
  }

  save(close: () => void) {
    this.dirty.set(false);
    close();
  }
}
