import { Component, DestroyRef, inject, signal, TemplateRef } from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpToast, NgpToastManager, NgpToastRef } from 'ng-primitives/toast';
import { injectDisposables } from 'ng-primitives/utils';

interface UploadContext {
  title: string;
  description: string;
  done: boolean;
}

@Component({
  selector: 'app-toast-update',
  imports: [NgpToast, NgpButton],
  template: `
    <button class="toast-trigger" [disabled]="uploading()" (click)="upload(toast)" ngpButton>
      Upload 3 files
    </button>

    <ng-template #toast let-dismiss="dismiss" let-context="context">
      <div
        #current="ngpToast"
        [attr.data-persistent]="context.done ? null : ''"
        ngpToast
        animate.enter="toast-enter"
        animate.leave="toast-leave"
      >
        <p class="toast-title">{{ context.title }}</p>
        <p class="toast-description">{{ context.description }}</p>
        <button class="toast-dismiss" (click)="dismiss()" ngpButton>Dismiss</button>
        <!-- Recreate the bar on each restart, so its CSS animation starts over. -->
        @for (restart of [current.restarts()]; track restart) {
          <div class="toast-progress"></div>
        }
      </div>
    </ng-template>
  `,
  styles: `
    .toast-trigger {
      padding-inline: 0.875rem;
      height: 2.125rem;
      border: none;
      border-radius: 0.5rem;
      font-weight: 510;
      color: var(--ngp-text-primary);
      background-color: var(--ngp-background);
      box-shadow: var(--ngp-button-shadow);
    }

    .toast-trigger[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    [ngpToast] {
      position: absolute;
      right: 0;
      bottom: 0;
      display: grid;
      grid-template-columns: 1fr auto;
      column-gap: 12px;
      align-items: center;
      box-sizing: border-box;
      width: 350px;
      padding: 12px 16px;
      overflow: hidden;
      border: 1px solid var(--ngp-border);
      border-radius: 8px;
      background: var(--ngp-background);
      box-shadow: var(--ngp-shadow);
      font-size: 0.75rem;
      line-height: 16px;
    }

    .toast-title {
      margin: 0;
      font-weight: 590;
      color: var(--ngp-text-primary);
    }

    .toast-description {
      grid-row: 2;
      margin: 0;
      color: var(--ngp-text-secondary);
    }

    .toast-dismiss {
      grid-row: 1 / 3;
      grid-column: 2;
      padding: 4px 8px;
      border: none;
      border-radius: 8px;
      font-weight: 590;
      color: var(--ngp-primary-text);
      background: var(--ngp-primary);
    }

    .toast-progress {
      position: absolute;
      inset: auto 0 0;
      height: 2px;
      background: var(--ngp-primary);
      transform-origin: left;
      animation: toast-progress var(--ngp-toast-duration) linear forwards;
    }

    [ngpToast][data-paused] .toast-progress {
      animation-play-state: paused;
    }

    [ngpToast][data-persistent] .toast-progress {
      display: none;
    }

    @keyframes toast-progress {
      to {
        transform: scaleX(0);
      }
    }

    .toast-enter {
      animation: toast-slide 400ms cubic-bezier(0.215, 0.61, 0.355, 1);
    }

    .toast-leave {
      animation: toast-slide 400ms cubic-bezier(0.215, 0.61, 0.355, 1) reverse forwards;
    }

    @keyframes toast-slide {
      from {
        opacity: 0;
        transform: translateY(100%);
      }
    }
  `,
})
export default class ToastUpdateExample {
  private readonly toastManager = inject(NgpToastManager);
  private readonly disposables = injectDisposables();
  protected readonly uploading = signal(false);
  private ref: NgpToastRef<UploadContext> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.ref?.dismiss());
  }

  upload(toast: TemplateRef<void>): void {
    this.uploading.set(true);
    this.ref?.dismiss();

    const ref = this.toastManager.show<UploadContext>(toast, {
      placement: 'bottom-end',
      persistent: true,
      context: { title: 'Uploading files', description: '1 of 3', done: false },
    });
    this.ref = ref;

    let uploaded = 1;
    const stop = this.disposables.setInterval(() => {
      uploaded++;

      if (uploaded <= 3) {
        ref.update({
          context: { title: 'Uploading files', description: `${uploaded} of 3`, done: false },
        });
        return;
      }

      stop();
      this.uploading.set(false);
      ref.update({
        context: { title: 'Files uploaded', description: '3 files are ready.', done: true },
        persistent: false,
        duration: 5000,
      });
    }, 1200);
  }
}
