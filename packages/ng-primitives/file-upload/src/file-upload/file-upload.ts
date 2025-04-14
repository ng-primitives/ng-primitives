import { BooleanInput, coerceStringArray } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, HostListener, input, output } from '@angular/core';
import { explicitEffect, setupInteractions } from 'ng-primitives/internal';
import { NgpFileDropzone } from '../file-dropzone/file-dropzone';
import { injectFileDropzoneState } from '../file-dropzone/file-dropzone-state';
import { fileUploadState, provideFileUploadState } from './file-upload-state';

/**
 * A directive that allows you to turn any element into a file upload trigger.
 */
@Directive({
  selector: '[ngpFileUpload]',
  exportAs: 'ngpFileUpload',
  providers: [provideFileUploadState()],
  host: {
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
  hostDirectives: [
    {
      directive: NgpFileDropzone,
      inputs: [
        'ngpFileDropzoneFileTypes:ngpFileUploadFileTypes',
        'ngpFileDropzoneMultiple:ngpFileUploadMultiple',
        'ngpFileDropzoneDirectory:ngpFileUploadDirectory',
        'ngpFileDropzoneDisabled:ngpFileUploadDisabled',
      ],
      outputs: [
        'ngpFileDropzoneSelected:ngpFileUploadSelected',
        'ngpFileDropzoneDragOver:ngpFileUploadDragOver',
      ],
    },
  ],
})
export class NgpFileUpload {
  /**
   * Access the dropzone state.
   */
  private readonly dropzone = injectFileDropzoneState();

  /**
   * The accepted file types.
   */
  readonly fileTypes = input<string[] | undefined, string>(undefined, {
    alias: 'ngpFileUploadFileTypes',
    transform: coerceStringArray,
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
   * Emits when the user cancels the file upload.
   * This is emitted when the user clicks the cancel button in the file upload dialog.
   */
  readonly canceled = output<void>({
    alias: 'ngpFileUploadCanceled',
  });

  /**
   * Store the file input element.
   */
  private input: HTMLInputElement = document.createElement('input');

  /**
   * The file upload state.
   */
  protected readonly state = fileUploadState<NgpFileUpload>(this);

  constructor() {
    this.input.type = 'file';
    this.input.addEventListener('change', () => this.selected.emit(this.input.files));
    this.input.addEventListener('cancel', () => this.canceled.emit());

    setupInteractions({ disabled: this.state.disabled });

    // sync the disabled and dragAndDrop state with the dropzone
    explicitEffect([this.state.disabled, this.state.dragAndDrop], ([disabled, dragAndDrop]) => {
      this.dropzone().disabled.set(disabled || !dragAndDrop);
    });
  }

  @HostListener('click')
  protected showFileDialog(): void {
    if (this.state.disabled()) {
      return;
    }

    const fileTypes = this.state.fileTypes()?.join(',');

    if (fileTypes) {
      this.input.accept = fileTypes;
    }

    this.input.multiple = this.state.multiple();
    this.input.webkitdirectory = this.state.directory();
    this.input.click();
  }
}
