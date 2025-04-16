import { Component } from '@angular/core';
import { FileUpload } from './file-upload';

@Component({
  selector: 'app-file-upload-example',
  imports: [FileUpload],
  template: `
    <app-file-upload (selected)="onFilesSelected($event)" />
  `,
})
export default class App {
  onFilesSelected(files: FileList | null): void {
    if (files) {
      alert(`Selected ${files.length} files.`);
    }
  }
}
