import { BooleanInput, coerceStringArray } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
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
   * The accepted file types. This can be an array of strings or a comma-separated string.
   * Accepted types can either be file extensions (e.g. `.jpg`) or MIME types (e.g. `image/jpeg`).
   */
  readonly fileTypes = input<string[], string | string[]>(undefined, {
    alias: 'ngpFileUploadFileTypes',
    transform: types => coerceStringArray(types, ','),
  });

  /**
   * Whether to allow multiple files to be selected.
   */
  readonly multiple = input<boolean, BooleanInput>(false, {
    alias: 'ngpFileUploadMultiple',
    transform: booleanAttribute,
  });

  /**
   * Whether to allow the user to select directories.
   */
  readonly directory = input<boolean, BooleanInput>(false, {
    alias: 'ngpFileUploadDirectory',
    transform: booleanAttribute,
  });

  /**
   * Whether drag-and-drop is enabled.
   */
  readonly dragAndDrop = input<boolean, BooleanInput>(true, {
    alias: 'ngpFileUploadDragDrop',
    transform: booleanAttribute,
  });

  /**
   * Whether the file upload is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
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
   * Emits when uploaded files are rejected because they do not match the allowed {@link fileTypes}.
   */
  readonly rejected = output<void>({
    alias: 'ngpFileUploadRejected',
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
    dragAndDrop: this.dragAndDrop,
    disabled: this.disabled,
    onSelected: files => this.selected.emit(files),
    onCanceled: () => this.canceled.emit(),
    onRejected: () => this.rejected.emit(),
    onDragOver: isDragOver => this.dragOver.emit(isDragOver),
  });

  constructor() {
    ngpInteractions({
      hover: true,
      press: true,
      focusVisible: true,
      disabled: this.disabled,
    });
  }

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
