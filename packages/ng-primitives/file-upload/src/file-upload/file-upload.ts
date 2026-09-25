import { BooleanInput, coerceStringArray, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute, output } from '@angular/core';
import { injectFileUploadConfig } from '../config/file-upload-config';
import {
  coercePasteTarget,
  NgpFilePasteTarget,
  NgpFileRejection,
} from '../file-dropzone/file-drop-filter';
import { ngpFileUpload, provideFileUploadState } from './file-upload-state';

/**
 * A directive that allows you to turn any element into a file upload trigger.
 */
@Directive({
  selector: '[ngpFileUpload]',
  exportAs: 'ngpFileUpload',
  providers: [provideFileUploadState()],
})
export class NgpFileUpload {
  /**
   * Access the global file upload configuration.
   */
  private readonly config = injectFileUploadConfig();

  /**
   * The accepted file types. This can be an array of strings or a comma-separated string.
   * Accepted types can either be file extensions (e.g. `.jpg`) or MIME types (e.g. `image/jpeg`).
   */
  readonly fileTypes = input<string[] | undefined, string | string[]>(this.config.fileTypes, {
    alias: 'ngpFileUploadFileTypes',
    transform: types => coerceStringArray(types, ','),
  });

  /**
   * Whether to allow multiple files to be selected.
   */
  readonly multiple = input<boolean, BooleanInput>(this.config.multiple, {
    alias: 'ngpFileUploadMultiple',
    transform: booleanAttribute,
  });

  /**
   * Whether to allow the user to select directories.
   */
  readonly directory = input<boolean, BooleanInput>(this.config.directory, {
    alias: 'ngpFileUploadDirectory',
    transform: booleanAttribute,
  });

  /**
   * Whether drag-and-drop is enabled.
   */
  readonly dragAndDrop = input<boolean, BooleanInput>(this.config.dragAndDrop, {
    alias: 'ngpFileUploadDragDrop',
    transform: booleanAttribute,
  });

  /**
   * The maximum size of each file in bytes. Larger files are rejected.
   */
  readonly maxFileSize = input<number | undefined, NumberInput>(this.config.maxFileSize, {
    alias: 'ngpFileUploadMaxFileSize',
    transform: numberAttribute,
  });

  /**
   * Where pasted files are captured: `'host'` (or the bare attribute) while the element is focused,
   * `'document'` anywhere on the page, or `false` to ignore pastes.
   */
  readonly paste = input<NgpFilePasteTarget, BooleanInput | NgpFilePasteTarget>(
    this.config.paste ?? false,
    {
      alias: 'ngpFileUploadPaste',
      transform: coercePasteTarget,
    },
  );

  /**
   * Whether the file upload is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(this.config.disabled, {
    alias: 'ngpFileUploadDisabled',
    transform: booleanAttribute,
  });

  /**
   * Emits when the user selects files.
   */
  readonly selected = output<FileList | null>({
    alias: 'ngpFileUploadSelected',
  });

  /**
   * Emits when the user cancel the file selection.
   */
  readonly canceled = output<void>({
    alias: 'ngpFileUploadCanceled',
  });

  /**
   * Emits when no files are selected because every file failed validation.
   */
  readonly rejected = output<void>({
    alias: 'ngpFileUploadRejected',
  });

  /**
   * Emits every file that failed validation and why, including when other files were accepted.
   */
  readonly rejectedFiles = output<NgpFileRejection[]>({
    alias: 'ngpFileUploadRejectedFiles',
  });

  /**
   * Emits when the user drags a file over the file upload.
   */
  readonly dragOver = output<boolean>({
    alias: 'ngpFileUploadDragOver',
  });

  private readonly state = ngpFileUpload({
    fileTypes: this.fileTypes,
    multiple: this.multiple,
    directory: this.directory,
    maxFileSize: this.maxFileSize,
    paste: this.paste,
    dragAndDrop: this.dragAndDrop,
    disabled: this.disabled,
    onSelected: files => this.selected.emit(files),
    onCanceled: () => this.canceled.emit(),
    onRejected: () => this.rejected.emit(),
    onRejectedFiles: rejections => this.rejectedFiles.emit(rejections),
    onDragOver: isDragOver => this.dragOver.emit(isDragOver),
  });

  /**
   * Whether the user is currently dragging a file over the file upload.
   */
  readonly isDragOver = this.state.isDragOver;

  /**
   * Show the file dialog.
   */
  showFileDialog(): void {
    this.state.showFileDialog();
  }
}
