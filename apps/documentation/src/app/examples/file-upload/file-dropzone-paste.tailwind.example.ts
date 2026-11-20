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
    <button
      class="h-[2.125rem] rounded-lg border-none bg-white px-3.5 text-sm font-[510] tracking-[-0.006em] text-zinc-900 shadow-xs ring-1 ring-black/5 transition-colors duration-150 ease-in-out outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
      [ngpDialogTrigger]="dialog"
      (click)="reset()"
      ngpButton
    >
      Upload images
    </button>

    <ng-template #dialog let-close="close">
      <div
        class="animate-fade fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-xs"
        ngpDialogOverlay
      >
        <div
          class="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-[0.875rem] border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
          ngpDialog
        >
          <h1
            class="mb-1 text-lg font-[590] tracking-[-0.014em] text-zinc-900 dark:text-zinc-100"
            ngpDialogTitle
          >
            Upload images
          </h1>
          <p class="mb-4 text-sm text-zinc-600 dark:text-zinc-400" ngpDialogDescription>
            Drop images below, or paste them anywhere while this is open.
          </p>

          <!-- document paste is scoped by the dialog: the listener only exists while it is open -->
          <div
            class="group flex flex-col items-center gap-1 rounded-[0.625rem] border-[1.5px] border-dashed border-zinc-300 bg-white px-4 py-6 transition-colors duration-150 data-dragover:border-[#f01e2b] data-dragover:bg-[#f01e2b]/[0.06] dark:border-zinc-700 dark:bg-zinc-950 dark:data-dragover:border-[#ff4651] dark:data-dragover:bg-[#ff4651]/[0.06]"
            (ngpFileDropzoneSelected)="onSelected($event)"
            (ngpFileDropzoneRejectedFiles)="onRejected($event)"
            ngpFileDropzone
            ngpFileDropzoneMultiple
            ngpFileDropzoneFileTypes="image/*"
            ngpFileDropzoneMaxFileSize="5242880"
            ngpFileDropzonePaste="document"
          >
            <ng-icon
              class="mb-1 text-xl text-zinc-400 group-data-dragover:text-[#f01e2b] dark:text-zinc-500 dark:group-data-dragover:text-[#ff4651]"
              name="heroCloudArrowUp"
              aria-hidden="true"
            />
            <p class="m-0 text-sm font-[510] tracking-[-0.006em] text-zinc-900 dark:text-zinc-100">
              Drag and drop, paste, or
              <!-- the dropzone handles drops, so the picker only opens the dialog -->
              <button
                class="cursor-pointer rounded border-none bg-transparent p-0 font-[inherit] text-zinc-900 underline underline-offset-2 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:decoration-2 dark:text-zinc-100 dark:data-focus-visible:outline-blue-400"
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
            <p class="m-0 text-xs tracking-[-0.011em] text-zinc-500 dark:text-zinc-400">
              Images up to 5 MB
            </p>
          </div>

          @if (files().length) {
            <ul class="mt-3 flex list-none flex-col gap-1 p-0 text-[0.8125rem] tracking-[-0.006em]">
              @for (file of files(); track file) {
                <li
                  class="flex items-center gap-2 rounded-lg py-1 pr-1 pl-3 ring-1 ring-zinc-200 ring-inset dark:ring-zinc-800"
                >
                  <span class="flex-1 truncate text-zinc-900 dark:text-zinc-100">
                    {{ file.name }}
                  </span>
                  <span class="text-zinc-500 tabular-nums dark:text-zinc-400">
                    {{ formatSize(file.size) }}
                  </span>
                  <button
                    class="flex size-6 items-center justify-center rounded-md border-none bg-transparent text-zinc-500 transition-colors duration-150 outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-hover:text-zinc-900 data-press:bg-zinc-100 dark:text-zinc-400 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-hover:text-zinc-100 dark:data-press:bg-zinc-800"
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

          <ul
            class="m-0 flex list-none flex-col p-0 text-[0.8125rem] tracking-[-0.006em]"
            aria-live="polite"
          >
            @for (error of errors(); track $index) {
              <li class="mt-2 flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                <ng-icon
                  class="shrink-0 text-zinc-500 dark:text-zinc-400"
                  name="heroExclamationCircle"
                  aria-hidden="true"
                />
                {{ error }}
              </li>
            }
          </ul>

          <div class="mt-6 flex justify-end gap-2">
            <button
              class="h-[2.125rem] rounded-lg border-none bg-white px-3.5 text-sm font-[510] tracking-[-0.006em] text-zinc-900 shadow-xs ring-1 ring-black/5 transition-colors duration-150 ease-in-out outline-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-zinc-50 data-press:bg-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 dark:ring-white/10 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-zinc-900 dark:data-press:bg-zinc-800"
              (click)="close()"
              ngpButton
            >
              Cancel
            </button>
            <button
              class="h-[2.125rem] rounded-lg border-none bg-[#f01e2b] px-3.5 text-sm font-[510] tracking-[-0.006em] text-white shadow-xs transition-colors duration-150 ease-in-out outline-none data-disabled:cursor-not-allowed data-disabled:bg-zinc-100 data-disabled:text-zinc-400 data-disabled:shadow-none data-focus-visible:outline-2 data-focus-visible:outline-offset-2 data-focus-visible:outline-blue-500 data-hover:bg-[#d81825] data-press:bg-[#c1141f] dark:bg-[#ff4651] dark:data-disabled:bg-zinc-900 dark:data-disabled:text-zinc-500 dark:data-focus-visible:outline-blue-400 dark:data-hover:bg-[#ff5d67] dark:data-press:bg-[#f0303c]"
              [disabled]="!files().length"
              (click)="close()"
              ngpButton
            >
              {{ uploadLabel() }}
            </button>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
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

    .animate-fade {
      animation: fadeIn 150ms ease-out;
    }

    .animate-fade[data-exit] {
      animation: fadeOut 150ms ease-out;
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
