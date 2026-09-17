import { BooleanInput, coerceStringArray } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { injectFileDropzoneConfig } from '../config/file-dropzone-config';
import { ngpFileDropzone, provideFileDropzoneState } from './file-dropzone-state';

/**
 * Capture files dropped on the element.
 */
@Directive({
  selector: '[ngpFileDropzone]',
  exportAs: 'ngpFileDropzone',
  providers: [provideFileDropzoneState()],
})
export class NgpFileDropzone {
  /**
   * Access the global file dropzone configuration.
   */
  private readonly config = injectFileDropzoneConfig();

  /**
   * The accepted file types. This can be an array of strings or a comma-separated string.
   * Accepted types can either be file extensions (e.g. `.jpg`) or MIME types (e.g. `image/jpeg`).
   */
  readonly fileTypes = input<string[] | undefined, string | string[]>(this.config.fileTypes, {
    alias: 'ngpFileDropzoneFileTypes',
    transform: types => coerceStringArray(types, ','),
  });

  /**
   * Whether to allow multiple files to be selected.
   */
  readonly multiple = input<boolean, BooleanInput>(this.config.multiple, {
    alias: 'ngpFileDropzoneMultiple',
    transform: booleanAttribute,
  });

  /**
   * Whether to allow the user to select directories.
   */
  readonly directory = input<boolean, BooleanInput>(this.config.directory, {
    alias: 'ngpFileDropzoneDirectory',
    transform: booleanAttribute,
  });

  /**
   * Whether the file dropzone is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(this.config.disabled, {
    alias: 'ngpFileDropzoneDisabled',
    transform: booleanAttribute,
  });

  /**
   * Emits when the user selects files.
   */
  readonly selected = output<FileList | null>({
    alias: 'ngpFileDropzoneSelected',
  });

  /**
   * Emits when uploaded files are rejected because they do not match the allowed {@link fileTypes}.
   */
  readonly rejected = output<void>({
    alias: 'ngpFileDropzoneRejected',
  });

  /**
   * Emits when the user drags a file over the file upload.
   */
  readonly dragOver = output<boolean>({
    alias: 'ngpFileDropzoneDragOver',
  });

  private readonly state = ngpFileDropzone({
    fileTypes: this.fileTypes,
    multiple: this.multiple,
    directory: this.directory,
    disabled: this.disabled,
    onSelected: files => this.selected.emit(files),
    onRejected: () => this.rejected.emit(),
    onDragOver: isDragOver => this.dragOver.emit(isDragOver),
  });

  /**
   * Whether the user is currently dragging a file over the file upload.
   */
  readonly isDragOver = this.state.isDragOver;
}
