import { Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCloudArrowUp, heroExclamationCircle, heroXMark } from '@ng-icons/heroicons/outline';
import { NgpButton } from 'ng-primitives/button';
import {
  NgpDialog,
  NgpDialogDescription,
  NgpDialogOverlay,
  NgpDialogTitle,
  NgpDialogTrigger,
} from 'ng-primitives/dialog';
import {
  NgpFileDropzone,
  NgpFileRejection,
  NgpFileRejectionReason,
  NgpFileUpload,
} from 'ng-primitives/file-upload';

const problems: Record<NgpFileRejectionReason, string> = {
  type: 'is not an image',
  size: 'is larger than 5 MB',
  count: 'is one file too many',
};

@Component({
  selector: 'app-file-dropzone-paste',
  imports: [
    NgpButton,
    NgpDialog,
    NgpDialogOverlay,
    NgpDialogTitle,
    NgpDialogDescription,
    NgpDialogTrigger,
    NgpFileDropzone,
    NgpFileUpload,
    NgIcon,
  ],
  providers: [provideIcons({ heroCloudArrowUp, heroExclamationCircle, heroXMark })],
  template: `
    <button [ngpDialogTrigger]="dialog" (click)="reset()" ngpButton>Upload images</button>

    <ng-template #dialog let-close="close">
      <div ngpDialogOverlay>
        <div ngpDialog>
          <h1 ngpDialogTitle>Upload images</h1>
          <p ngpDialogDescription>Drop images below, or paste them anywhere while this is open.</p>

          <!-- document paste is scoped by the dialog: the listener only exists while it is open -->
          <div
            (ngpFileDropzoneSelected)="onSelected($event)"
            (ngpFileDropzoneRejectedFiles)="onRejected($event)"
            ngpFileDropzone
            ngpFileDropzoneMultiple
            ngpFileDropzoneFileTypes="image/*"
            ngpFileDropzoneMaxFileSize="5242880"
            ngpFileDropzonePaste="document"
          >
            <ng-icon class="dropzone-icon" name="heroCloudArrowUp" aria-hidden="true" />
            <p class="dropzone-title">
              Drag and drop, paste, or
              <!-- the dropzone handles drops, so the picker only opens the dialog -->
              <button
                class="browse-button"
                [ngpFileUploadDragDrop]="false"
                (ngpFileUploadSelected)="onSelected($event)"
                (ngpFileUploadRejectedFiles)="onRejected($event)"
                ngpFileUpload
                ngpFileUploadMultiple
                ngpFileUploadFileTypes="image/*"
                ngpFileUploadMaxFileSize="5242880"
              >
                browse
              </button>
            </p>
            <p class="dropzone-hint">Images up to 5 MB</p>
          </div>

          @if (files().length) {
            <ul class="file-list">
              @for (file of files(); track file) {
                <li>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatSize(file.size) }}</span>
                  <button
                    class="remove-button"
                    [attr.aria-label]="'Remove ' + file.name"
                    (click)="remove(file)"
                    ngpButton
                  >
                    <ng-icon name="heroXMark" aria-hidden="true" />
                  </button>
                </li>
              }
            </ul>
          }

          <ul class="error-list" aria-live="polite">
            @for (error of errors(); track $index) {
              <li>
                <ng-icon name="heroExclamationCircle" aria-hidden="true" />
                {{ error }}
              </li>
            }
          </ul>

          <div class="dialog-footer">
            <button (click)="close()" ngpButton>Cancel</button>
            <button [disabled]="!files().length" (click)="close()" ngpButton>
              {{ uploadLabel() }}
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    [ngpButton] {
      display: inline-flex;
      align-items: center;
      justify-content: center;
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
      transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow:
        inset 0 0 0 1px var(--ngp-border),
        0 1px 2px 0 rgba(0, 0, 0, 0.04);
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

    [ngpDialogOverlay] {
      background-color: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 150ms ease-out;
    }

    [ngpDialogOverlay][data-exit] {
      animation: fadeOut 150ms ease-out;
    }

    [ngpDialog] {
      width: 100%;
      max-width: 28rem;
      max-height: calc(100dvh - 32px);
      overflow-y: auto;
      background-color: var(--ngp-background);
      padding: 24px;
      border-radius: 0.875rem;
      border: 1px solid var(--ngp-border);
      box-shadow: var(--ngp-shadow-lg);
    }

    [ngpDialogTitle] {
      font-size: 18px;
      line-height: 28px;
      font-weight: 590;
      letter-spacing: -0.014em;
      color: var(--ngp-text-primary);
      margin: 0 0 4px;
    }

    [ngpDialogDescription] {
      font-size: 14px;
      line-height: 20px;
      color: var(--ngp-text-secondary);
      margin: 0 0 16px;
    }

    [ngpFileDropzone] {
      display: flex;
      flex-direction: column;
      align-items: center;
      row-gap: 4px;
      padding: 24px 16px;
      border-radius: 0.625rem;
      border: 1.5px dashed var(--ngp-border-secondary);
      background-color: var(--ngp-background);
      color: var(--ngp-text-tertiary);
      transition:
        border-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
        background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    [ngpFileDropzone][data-dragover] {
      border-color: var(--ngp-primary);
      background-color: color-mix(in srgb, var(--ngp-primary) 6%, var(--ngp-background));
      color: var(--ngp-primary);
    }

    .dropzone-icon {
      font-size: 20px;
      margin-bottom: 4px;
    }

    .dropzone-title {
      font-size: 0.875rem;
      font-weight: 510;
      letter-spacing: -0.006em;
      color: var(--ngp-text-primary);
      margin: 0;
    }

    .browse-button {
      padding: 0;
      border: none;
      border-radius: 0.25rem;
      background: none;
      font: inherit;
      color: var(--ngp-text-primary);
      text-decoration: underline;
      text-underline-offset: 2px;
      cursor: pointer;
    }

    .browse-button[data-hover] {
      text-decoration-thickness: 2px;
    }

    .browse-button[data-focus-visible] {
      outline: 2px solid var(--ngp-focus-ring);
      outline-offset: 2px;
    }

    .dropzone-hint {
      font-size: 0.75rem;
      letter-spacing: -0.011em;
      color: var(--ngp-text-tertiary);
      margin: 0;
    }

    .file-list,
    .error-list {
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      font-size: 0.8125rem;
      letter-spacing: -0.006em;
    }

    .file-list {
      margin: 12px 0 0;
      row-gap: 4px;
    }

    .file-list li {
      display: flex;
      align-items: center;
      column-gap: 8px;
      padding: 4px 4px 4px 12px;
      border-radius: 0.5rem;
      box-shadow: inset 0 0 0 1px var(--ngp-border);
    }

    .file-name {
      flex: 1;
      color: var(--ngp-text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-size {
      color: var(--ngp-text-tertiary);
      font-variant-numeric: tabular-nums;
    }

    .remove-button {
      width: 24px;
      height: 24px;
      padding: 0;
      border-radius: 0.375rem;
      color: var(--ngp-text-tertiary);
      box-shadow: none;
    }

    .remove-button[data-hover] {
      color: var(--ngp-text-primary);
    }

    .error-list {
      margin: 0;
    }

    .error-list li {
      display: flex;
      align-items: center;
      column-gap: 6px;
      margin-top: 8px;
      color: var(--ngp-text-secondary);
    }

    .error-list ng-icon {
      flex-shrink: 0;
      color: var(--ngp-text-tertiary);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      margin-top: 24px;
      column-gap: 8px;
    }

    .dialog-footer [ngpButton]:last-of-type {
      background-color: var(--ngp-primary);
      color: var(--ngp-primary-text);
      box-shadow:
        inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
        0 1px 2px 0 rgba(0, 0, 0, 0.08);
    }

    .dialog-footer [ngpButton]:last-of-type[data-hover] {
      background-color: var(--ngp-primary-hover);
    }

    .dialog-footer [ngpButton]:last-of-type[data-disabled] {
      background-color: var(--ngp-background-disabled);
      color: var(--ngp-text-disabled);
      box-shadow: none;
      cursor: not-allowed;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
    }

    @keyframes fadeOut {
      to {
        opacity: 0;
      }
    }
  `,
})
export default class FileDropzonePasteExample {
  readonly files = signal<File[]>([]);
  readonly errors = signal<string[]>([]);
  readonly uploadLabel = computed(() => {
    const count = this.files().length;
    return count ? `Upload ${count} ${count === 1 ? 'image' : 'images'}` : 'Upload';
  });

  onSelected(files: FileList | null): void {
    this.files.update(current => [...current, ...Array.from(files ?? [])]);
    this.errors.set([]);
  }

  onRejected(rejections: NgpFileRejection[]): void {
    this.errors.set(
      rejections.map(
        ({ file, reasons }) => `${file.name} ${reasons.map(r => problems[r]).join(' and ')}.`,
      ),
    );
  }

  remove(file: File): void {
    this.files.update(files => files.filter(f => f !== file));
  }

  reset(): void {
    this.files.set([]);
    this.errors.set([]);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    return bytes < 1024 * 1024
      ? `${Math.round(bytes / 1024)} KB`
      : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}
