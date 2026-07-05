import { Component } from '@angular/core';
import { NgpFileUpload } from 'ng-primitives/file-upload';

/**
 * Inline fixture mirroring
 * `apps/components/.../reusable-components/file-upload/file-upload.ts`.
 * Used by the reusable-component test suite.
 */
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
})
export class FileUpload {}
