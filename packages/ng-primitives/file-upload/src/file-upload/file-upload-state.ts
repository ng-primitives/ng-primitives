import { DOCUMENT, inject, Signal, signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, emitter, listener } from 'ng-primitives/state';
import { Observable } from 'rxjs';
import { fileDropFilter } from '../file-dropzone/file-drop-filter';

/**
 * The state for the NgpFileUpload directive.
 */
export interface NgpFileUploadState {
  /**
   * Whether the user is currently dragging over the element.
   */
  readonly isDragOver: Signal<boolean>;
  /**
   * Observable that emits when files are selected.
   */
  readonly selected: Observable<FileList | null>;
  /**
   * Observable that emits when file selection is canceled.
   */
  readonly canceled: Observable<void>;
  /**
   * Observable that emits when files are rejected.
   */
  readonly rejected: Observable<void>;
  /**
   * Observable that emits when drag over state changes.
   */
  readonly dragOver: Observable<boolean>;
  /**
   * Show the file dialog.
   */
  showFileDialog(): void;
}

/**
 * The props for the NgpFileUpload state.
 */
export interface NgpFileUploadProps {
  /**
   * The accepted file types.
   */
  readonly fileTypes?: Signal<string[] | undefined>;
  /**
   * Whether multiple files can be selected.
   */
  readonly multiple?: Signal<boolean>;
  /**
   * Whether directories can be selected.
   */
  readonly directory?: Signal<boolean>;
  /**
   * Whether drag and drop is enabled.
   */
  readonly dragAndDrop?: Signal<boolean>;
  /**
   * Whether the file upload is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Callback when files are selected.
   */
  readonly onSelected?: (files: FileList | null) => void;
  /**
   * Callback when file selection is canceled.
   */
  readonly onCanceled?: () => void;
  /**
   * Callback when files are rejected.
   */
  readonly onRejected?: () => void;
  /**
   * Callback when drag over state changes.
   */
  readonly onDragOver?: (isDragOver: boolean) => void;
}

export const [
  NgpFileUploadStateToken,
  ngpFileUpload,
  injectFileUploadState,
  provideFileUploadState,
] = createPrimitive(
  'NgpFileUpload',
  ({
    fileTypes,
    multiple,
    directory,
    dragAndDrop,
    disabled,
    onSelected,
    onCanceled,
    onRejected,
    onDragOver,
  }: NgpFileUploadProps) => {
    const element = injectElementRef();
    const document = inject(DOCUMENT);

    const isDragOver = signal(false);

    // Create observables
    const selected = emitter<FileList | null>();
    const canceled = emitter<void>();
    const rejected = emitter<void>();
    const dragOver = emitter<boolean>();

    // Host bindings
    dataBinding(element, 'data-disabled', () => (disabled?.() ? '' : null));
    dataBinding(element, 'data-dragover', () => (isDragOver() ? '' : null));

    // Setup interactions
    ngpInteractions({
      hover: true,
      press: true,
      focusVisible: true,
      disabled,
    });

    // Create file input
    const input: HTMLInputElement = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';

    input.addEventListener('change', () => {
      const files = input.files;
      selected.emit(files);
      onSelected?.(files);
      input.value = '';
    });

    input.addEventListener('cancel', () => {
      canceled.emit();
      onCanceled?.();
    });

    function showFileDialog(): void {
      if (disabled?.()) {
        return;
      }

      const fileTypesValue = fileTypes?.()?.join(',');
      if (fileTypesValue) {
        input.accept = fileTypesValue;
      }

      input.multiple = multiple?.() ?? false;
      input.webkitdirectory = directory?.() ?? false;
      input.click();
    }

    function onDragEnter(event: DragEvent): void {
      if (disabled?.() || !dragAndDrop?.()) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      isDragOver.set(true);
      dragOver.emit(true);
      onDragOver?.(true);
    }

    function onDragOverHandler(event: DragEvent): void {
      if (disabled?.() || !dragAndDrop?.()) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();
      isDragOver.set(true);
    }

    function onDragLeave(event: DragEvent): void {
      if (disabled?.() || !dragAndDrop?.() || !isDragOver()) {
        return;
      }

      // if the element we are dragging over is a child of the file upload, ignore the event
      if (element.nativeElement.contains(event.relatedTarget as Node)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      isDragOver.set(false);
      dragOver.emit(false);
      onDragOver?.(false);
    }

    function onDrop(event: DragEvent): void {
      if (disabled?.() || !dragAndDrop?.()) {
        return;
      }

      event.preventDefault();
      isDragOver.set(false);
      dragOver.emit(false);
      onDragOver?.(false);

      const fileList = event.dataTransfer?.files;
      if (fileList) {
        const filteredFiles = fileDropFilter(fileList, fileTypes?.(), multiple?.() ?? false);

        if (filteredFiles) {
          selected.emit(filteredFiles);
          onSelected?.(filteredFiles);
        } else {
          rejected.emit();
          onRejected?.();
        }
      }
    }

    // Event listeners
    listener(element, 'click', showFileDialog);
    listener(element, 'dragenter', onDragEnter);
    listener(element, 'dragover', onDragOverHandler);
    listener(element, 'dragleave', onDragLeave);
    listener(element, 'drop', onDrop);

    return {
      isDragOver,
      selected: selected.asObservable(),
      canceled: canceled.asObservable(),
      rejected: rejected.asObservable(),
      dragOver: dragOver.asObservable(),
      showFileDialog,
    };
  },
);
