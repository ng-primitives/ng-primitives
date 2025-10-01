import { BooleanInput, coerceStringArray } from '@angular/cdk/coercion';
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
import { ngpHoverInteraction } from 'ng-primitives/interactions';
import { fileDropFilter } from './file-drop-filter';
import { fileDropzoneState, provideFileDropzoneState } from './file-dropzone-state';

/**
 * Capture files dropped on the element.
 */
@Directive({
  selector: '[ngpFileDropzone]',
  exportAs: 'ngpFileDropzone',
  providers: [provideFileDropzoneState()],
  host: {
    '[attr.data-dragover]': 'isDragOver() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
  },
})
export class NgpFileDropzone {
  /**
   * Access the host element.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * The accepted file types. This can be an array of strings or a comma-separated string.
   * Accepted types can either be file extensions (e.g. `.jpg`) or MIME types (e.g. `image/jpeg`).
   */
  readonly fileTypes = input<string[], string | string[]>(undefined, {
    alias: 'ngpFileDropzoneFileTypes',
    transform: types => coerceStringArray(types, ','),
  });

  /**
   * Whether to allow multiple files to be selected.
   */
  readonly multiple = input<boolean, BooleanInput>(false, {
    alias: 'ngpFileDropzoneMultiple',
    transform: booleanAttribute,
  });

  /**
   * Whether to allow the user to select directories.
   */
  readonly directory = input<boolean, BooleanInput>(false, {
    alias: 'ngpFileDropzoneDirectory',
    transform: booleanAttribute,
  });

  /**
   * Whether the file upload is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
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

  /**
   * Whether the user is currently dragging a file over the file upload.
   */
  protected readonly isDragOver = signal<boolean>(false);

  /**
   * The file upload state.
   */
  private readonly state = fileDropzoneState<NgpFileDropzone>(this);

  constructor() {
    ngpHoverInteraction({ disabled: this.state.disabled });
  }

  @HostListener('dragenter', ['$event'])
  protected onDragEnter(event: DragEvent): void {
    if (this.state.disabled()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
    this.dragOver.emit(true);
  }

  @HostListener('dragover', ['$event'])
  protected onDragOver(event: DragEvent): void {
    if (this.state.disabled()) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    this.isDragOver.set(true);
  }

  @HostListener('dragleave', ['$event'])
  protected onDragLeave(event: DragEvent): void {
    if (this.state.disabled() || !this.isDragOver()) {
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
    if (this.state.disabled()) {
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
