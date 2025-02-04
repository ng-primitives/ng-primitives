import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCloudArrowUp } from '@ng-icons/heroicons/outline';
import { NgpFileUpload } from 'ng-primitives/file-upload';

@Component({
  selector: 'app-file-upload',
  imports: [NgpFileUpload, NgIcon],
  viewProviders: [provideIcons({ heroCloudArrowUp })],
  template: `
    <div (ngpFileUploadSelected)="onFilesSelected($event)" ngpFileUpload ngpFileUploadMultiple>
      <ng-icon name="heroCloudArrowUp" aria-hidden="true" />
      <p class="heading">Select or drag and drop files here.</p>
      <p class="subheading">Max file size: 10MB</p>
    </div>
  `,
  styles: `
    :host {
      --file-upload-background-color: rgb(255 255 255);
      --file-upload-border-color: rgb(229 231 235);
      --file-upload-border-color-hover: rgb(59 130 246);
      --file-upload-border-color-focus: rgb(59 130 246);
      --file-upload-border-color-drag-over: rgb(59 130 246);
      --file-upload-background-color-drag-over: rgb(239, 246, 255);
      --file-upload-icon-color: rgb(156 163 175);

      --file-upload-background-color-dark: rgb(43 43 43);
      --file-upload-border-color-dark: rgb(128 128 128);
      --file-upload-border-color-hover-dark: rgb(59 130 246);
      --file-upload-border-color-focus-dark: rgb(59 130 246);
      --file-upload-border-color-drag-over-dark: rgb(59 130 246);
      --file-upload-background-color-drag-over-dark: rgba(128, 128, 128, 0.35);
      --file-upload-icon-color-dark: rgb(225 225 225);
    }

    [ngpFileUpload] {
      display: flex;
      cursor: pointer;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      row-gap: 0.25rem;
      border-radius: 0.5rem;
      border: 1px dashed
        light-dark(var(--file-upload-border-color), var(--file-upload-border-color-dark));
      background-color: light-dark(
        var(--file-upload-background-color),
        var(--file-upload-background-color-dark)
      );
      padding: 2rem 3rem;
    }

    [ngpFileUpload][data-dragover] {
      border-color: light-dark(
        var(--file-upload-border-color-drag-over),
        var(--file-upload-border-color-drag-over-dark)
      );
      background-color: light-dark(
        var(--file-upload-background-color-drag-over),
        var(--file-upload-background-color-drag-over-dark)
      );
    }

    ng-icon {
      color: light-dark(var(--file-upload-icon-color), var(--file-upload-icon-color-dark));
      font-size: 20px;
      margin-bottom: 0.25rem;
    }

    .heading {
      font-size: 0.875rem;
      font-weight: 500;
      color: light-dark(var(--file-upload-heading-color), var(--file-upload-heading-color-dark));
      line-height: 1.25rem;
      text-align: center;
      margin: 0;
    }

    .subheading {
      font-size: 0.75rem;
      color: light-dark(
        var(--file-upload-subheading-color),
        var(--file-upload-subheading-color-dark)
      );
      line-height: 1rem;
      text-align: center;
      margin: 0;
    }
  `,
})
export default class FileUploadExample {
  onFilesSelected(files: FileList | null): void {
    if (files) {
      alert(`Selected ${files.length} files.`);
    }
  }
}
