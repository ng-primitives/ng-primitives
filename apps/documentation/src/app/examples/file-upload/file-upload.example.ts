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
      (ngpFileUploadSelected)="onFilesSelected($event)"
      ngpFileUploadFileTypes=".svg, .pdf"
      ngpFileUpload
      ngpFileUploadMultiple
    >
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
      border: 1px dashed var(--ngp-border-secondary);
      background-color: var(--ngp-background);
      padding: 2rem 3rem;
    }

    [ngpFileUpload][data-dragover] {
      border-color: var(--ngp-border);
      background-color: var(--ngp-background-hover);
    }

    ng-icon {
      color: var(--ngp-text-primary);
      font-size: 20px;
      margin-bottom: 0.25rem;
    }

    .heading {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--ngp-text-primary);
      line-height: 1.25rem;
      text-align: center;
      margin: 0;
    }

    .subheading {
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
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
