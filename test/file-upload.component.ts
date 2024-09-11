import { Component } from '@angular/core';
import { NgpFileUpload } from 'ng-primitives/file-upload';

@Component({
  standalone: true,
  selector: 'app-file-upload',
  hostDirectives: [
    {
      directive: NgpFileUpload,
      inputs: ['ngpFileUploadMultiple:multiple'],
      outputs: ['ngpFileUploadDragOver:dragOver', 'ngpFileUploadSelected:selected'],
    },
  ],
  templateUrl: './file-upload.component.html',
  styleUrl: './file-upload.component.css',
})
export class FileUploadComponent {}
