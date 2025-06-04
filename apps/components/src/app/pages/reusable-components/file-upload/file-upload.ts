import { Component } from '@angular/core';
import { NgpFileUpload } from 'ng-primitives/file-upload';

@Component({
  selector: 'app-file-upload',
  hostDirectives: [
    {
      directive: NgpFileUpload,
      inputs: [
        'ngpFileUploadFileTypes:types',
        'ngpFileUploadMultiple:multiple',
        'ngpFileUploadDirectory:directory',
        'ngpFileUploadDragDrop:dragDrop',
        'ngpFileUploadDisabled:disabled',
      ],
      outputs: ['ngpFileUploadSelected:selected', 'ngpFileUploadCanceled:canceled'],
    },
  ],
  template: `
    Drop files here or click to upload
  `,
  styles: `
    :host {
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

    :host[data-dragover] {
      border-color: var(--ngp-border);
      background-color: var(--ngp-background-hover);
    }
  `,
})
export class FileUpload {}
