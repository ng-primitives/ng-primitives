import { BooleanInput, coerceStringArray } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
  booleanAttribute,
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { fileDropFilter } from '../file-dropzone/file-drop-filter';
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
    '[attr.data-dragover]': 'isDragOver() ? "" : null',
  },
})
export class NgpFileUpload {
  /**
   * Access the document
   */
  private readonly document = inject<Document>(DOCUMENT);

  /**
   * Access the host element.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

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

  /**
   * Whether the user is currently dragging a file over the file upload.
   */
  protected readonly isDragOver = signal<boolean>(false);

  /**
   * Store the file input element.
   */
  private input: HTMLInputElement = this.document.createElement('input');

  /**
   * The file upload state.
   */
  protected readonly state = fileUploadState<NgpFileUpload>(this);

  constructor() {
    ngpInteractions({
      hover: true,
      press: true,
      focusVisible: true,
      disabled: this.state.disabled,
    });
    this.input.type = 'file';
    this.input.addEventListener('change', () => {
      this.selected.emit(this.input.files);
      // clear the input value to allow re-uploading the same file
      this.input.value = '';
    });
    this.input.addEventListener('cancel', () => this.canceled.emit());
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

  @HostListener('dragenter', ['$event'])
  protected onDragEnter(event: DragEvent): void {
    if (this.state.disabled() || !this.state.dragAndDrop()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
    this.dragOver.emit(true);
  }

  @HostListener('dragover', ['$event'])
  protected onDragOver(event: DragEvent): void {
    if (this.state.disabled() || !this.state.dragAndDrop()) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    this.isDragOver.set(true);
  }

  @HostListener('dragleave', ['$event'])
  protected onDragLeave(event: DragEvent): void {
    if (this.state.disabled() || !this.state.dragAndDrop() || !this.isDragOver()) {
      return;
    }

    // if the element we are dragging over is a child of the file upload, ignore the event
    if (this.elementRef.nativeElement.contains(event.relatedTarget as Node)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    this.dragOver.emit(false);
  }

  @HostListener('drop', ['$event'])
  protected onDrop(event: DragEvent): void {
    if (this.state.disabled() || !this.state.dragAndDrop()) {
      return;
    }

    event.preventDefault();
    this.isDragOver.set(false);
    this.dragOver.emit(false);

    const fileList = event.dataTransfer?.files;
    if (fileList) {
      const filteredFiles = fileDropFilter(fileList, this.state.fileTypes(), this.state.multiple());

      if (filteredFiles) {
        this.selected.emit(filteredFiles);
      } else {
        this.rejected.emit();
      }
    }
  }
}
