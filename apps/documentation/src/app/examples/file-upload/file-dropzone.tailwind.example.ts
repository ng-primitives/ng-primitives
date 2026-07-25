import { Component } from '@angular/core';
import { NgpFileDropzone } from 'ng-primitives/file-upload';

@Component({
  selector: 'app-file-dropzone',
  imports: [NgpFileDropzone],
  template: `
    <div
      class="flex h-full w-full flex-col items-center justify-center gap-y-1 rounded-[0.625rem] border-[1.5px] border-dashed border-gray-300 bg-white px-12 py-8 transition-colors duration-150 data-dragover:border-[#f01e2b] data-dragover:bg-[#fef2f2] dark:border-gray-700 dark:bg-zinc-950 dark:data-dragover:border-[#ff4651] dark:data-dragover:bg-[#180d0f]"
      (ngpFileDropzoneSelected)="onFilesSelected($event)"
      (ngpFileDropzoneRejected)="onFilesRejected()"
      ngpFileDropzoneFileTypes=".svg, .pdf"
      ngpFileDropzone
    >
      <!-- the ! modifier keeps the docs site's prose heading styles from bleeding in -->
      <h3 class="m-0! text-center text-sm/5! font-[510]! text-gray-900 dark:text-gray-100">
        Drag and drop files anywhere here!
      </h3>
      <p class="m-0 text-center text-xs/4! text-gray-600 dark:text-gray-300">
        But clicking won't open a file selection dialog.
      </p>
    </div>
  `,
})
export default class FileDropzoneExample {
  onFilesSelected(files: FileList | null): void {
    if (files) {
      alert(`Selected ${files.length} files.`);
    }
  }

  onFilesRejected(): void {
    alert('File type not supported.');
  }
}
