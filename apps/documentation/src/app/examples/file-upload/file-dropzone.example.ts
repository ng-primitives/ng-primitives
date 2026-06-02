import { Component } from '@angular/core';
import { NgpFileDropzone } from 'ng-primitives/file-upload';

@Component({
  selector: 'app-file-dropzone',
  imports: [NgpFileDropzone],
  template: `
    <div
      (ngpFileDropzoneSelected)="onFilesSelected($event)"
      (ngpFileDropzoneRejected)="onFilesRejected()"
      ngpFileDropzoneFileTypes=".svg, .pdf"
      ngpFileDropzone
    >
      <h3>Drag and drop files anywhere here!</h3>
      <p>But clicking won't open a file selection dialog.</p>
    </div>
  `,
  styles: `
    [ngpFileDropzone] {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 3rem;
      flex-direction: column;
      row-gap: 0.25rem;
      width: 100%;
      height: 100%;
      border-radius: 0.625rem;
      border: 1.5px dashed var(--ngp-border-secondary);
      background-color: var(--ngp-background);
      padding: 2rem 3rem;
      transition:
        border-color 150ms ease,
        background-color 150ms ease;
    }

    [ngpFileDropzone][data-dragover] {
      border-color: var(--ngp-primary);
      background-color: color-mix(in srgb, var(--ngp-primary) 6%, var(--ngp-background));
    }

    h3 {
      font-size: 0.875rem;
      font-weight: 510;
      color: var(--ngp-text-primary);
      line-height: 1.25rem;
      text-align: center;
      margin: 0;
    }

    p {
      font-size: 0.75rem;
      color: var(--ngp-text-secondary);
      line-height: 1rem;
      text-align: center;
      margin: 0;
    }
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
