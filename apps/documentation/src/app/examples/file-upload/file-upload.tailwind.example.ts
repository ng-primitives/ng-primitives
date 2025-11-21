import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCloudArrowUp } from '@ng-icons/heroicons/outline';
import { NgpFileUpload } from 'ng-primitives/file-upload';

@Component({
  selector: 'app-file-upload',
  imports: [NgpFileUpload, NgIcon],
  providers: [provideIcons({ heroCloudArrowUp })],
  template: `
    <div
      class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 bg-white px-12 py-8 transition-colors data-dragover:border-gray-400 data-dragover:bg-gray-50 dark:border-gray-700 dark:bg-zinc-950 dark:data-dragover:border-gray-500 dark:data-dragover:bg-zinc-900"
      (ngpFileUploadSelected)="onFilesSelected($event)"
      (ngpFileUploadRejected)="onFilesRejected()"
      ngpFileUploadFileTypes=".svg, .pdf"
      ngpFileUpload
      ngpFileUploadMultiple
    >
      <ng-icon
        class="mb-1 text-xl text-gray-900 dark:text-gray-100"
        name="heroCloudArrowUp"
        aria-hidden="true"
      />
      <p class="m-0 text-center text-sm leading-5 font-medium text-gray-900 dark:text-gray-100">
        Select or drag and drop files here.
      </p>
      <p class="m-0 text-center text-xs leading-4 text-gray-600 dark:text-gray-300">
        Max file size: 10MB
      </p>
    </div>
  `,
})
export default class FileUploadExample {
  onFilesSelected(files: FileList | null): void {
    if (files) {
      alert(`Selected ${files.length} files.`);
    }
  }

  onFilesRejected(): void {
    alert('File type not supported.');
  }
}
