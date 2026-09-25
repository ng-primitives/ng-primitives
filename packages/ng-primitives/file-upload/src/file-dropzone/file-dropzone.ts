import { BooleanInput, coerceStringArray, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute, output } from '@angular/core';
import { injectFileDropzoneConfig } from '../config/file-dropzone-config';
import { coercePasteTarget, NgpFilePasteTarget, NgpFileRejection } from './file-drop-filter';
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
   * The maximum size of each file in bytes. Larger files are rejected.
   */
  readonly maxFileSize = input<number | undefined, NumberInput>(this.config.maxFileSize, {
    alias: 'ngpFileDropzoneMaxFileSize',
    transform: numberAttribute,
  });

  /**
   * Where pasted files are captured: `'host'` (or the bare attribute) while the element is focused,
   * `'document'` anywhere on the page, or `false` to ignore pastes.
   */
  readonly paste = input<NgpFilePasteTarget, BooleanInput | NgpFilePasteTarget>(this.config.paste, {
    alias: 'ngpFileDropzonePaste',
    transform: coercePasteTarget,
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
   * Emits when no files are selected because every file failed validation.
   */
  readonly rejected = output<void>({
    alias: 'ngpFileDropzoneRejected',
  });

  /**
   * Emits every file that failed validation and why, including when other files were accepted.
   */
  readonly rejectedFiles = output<NgpFileRejection[]>({
    alias: 'ngpFileDropzoneRejectedFiles',
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
    maxFileSize: this.maxFileSize,
    paste: this.paste,
    disabled: this.disabled,
    onSelected: files => this.selected.emit(files),
    onRejected: () => this.rejected.emit(),
    onRejectedFiles: rejections => this.rejectedFiles.emit(rejections),
    onDragOver: isDragOver => this.dragOver.emit(isDragOver),
  });

  /**
   * Whether the user is currently dragging a file over the file upload.
   */
  readonly isDragOver = this.state.isDragOver;
}
