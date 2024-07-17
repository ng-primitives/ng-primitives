import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCloudArrowUp } from '@ng-icons/heroicons/outline';
import { NgpFileUpload } from 'ng-primitives/file-upload';

@Component({
  standalone: true,
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
    [ngpFileUpload] {
      display: flex;
      cursor: pointer;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      row-gap: 0.25rem;
      border-radius: 0.5rem;
      border: 1px dashed rgb(229, 231, 235);
      background-color: rgb(255, 255, 255);
      padding: 2rem 3rem;
    }

    [ngpFileUpload][data-dragover='true'] {
      border-color: rgb(59, 130, 246);
      background-color: rgb(239, 246, 255);
    }

    ng-icon {
      color: rgb(156, 163, 175);
      font-size: 20px;
      margin-bottom: 0.25rem;
    }

    .heading {
      font-size: 0.875rem;
      font-weight: 500;
      color: rgb(17 24 39);
      line-height: 1.25rem;
      text-align: center;
    }

    .subheading {
      font-size: 0.75rem;
      color: rgb(107 114 128);
      line-height: 1rem;
      text-align: center;
    }
  `,
})
export default class FileUploadExample {
  onFilesSelected(files: FileList | null) {
    if (files) {
      alert(`Selected ${files.length} files.`);
    }
  }
}
