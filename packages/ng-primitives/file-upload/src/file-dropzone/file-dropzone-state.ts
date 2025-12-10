import { Signal, signal } from '@angular/core';
import { ngpHover } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, emitter, listener } from 'ng-primitives/state';
import { Observable } from 'rxjs';
import { fileDropFilter } from './file-drop-filter';

/**
 * The state for the NgpFileDropzone directive.
 */
export interface NgpFileDropzoneState {
  /**
   * Whether the user is currently dragging over the element.
   */
  readonly isDragOver: Signal<boolean>;
  /**
   * Observable that emits when files are selected.
   */
  readonly selected: Observable<FileList | null>;
  /**
   * Observable that emits when files are rejected.
   */
  readonly rejected: Observable<void>;
  /**
   * Observable that emits when drag over state changes.
   */
  readonly dragOverChanged: Observable<boolean>;
}

/**
 * The props for the NgpFileDropzone state.
 */
export interface NgpFileDropzoneProps {
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
   * Whether the file dropzone is disabled.
   */
  readonly disabled?: Signal<boolean>;
  /**
   * Callback when files are selected.
   */
  readonly onSelected?: (files: FileList | null) => void;
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
  NgpFileDropzoneStateToken,
  ngpFileDropzone,
  injectFileDropzoneState,
  provideFileDropzoneState,
] = createPrimitive(
  'NgpFileDropzone',
  ({
    fileTypes,
    multiple,
    directory,
    disabled,
    onSelected,
    onRejected,
    onDragOver,
  }: NgpFileDropzoneProps) => {
    const element = injectElementRef();
    const isDragOverState = signal(false);

    // Create observables
    const selected = emitter<FileList | null>();
    const rejected = emitter<void>();
    const dragOver = emitter<boolean>();

    // Host bindings
    dataBinding(element, 'data-dragover', () => (isDragOverState() ? '' : null));
    dataBinding(element, 'data-disabled', () => (disabled?.() ? '' : null));

    // Setup hover interaction
    ngpHover({ disabled });

    function onDragEnter(event: DragEvent): void {
      if (disabled?.()) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      isDragOverState.set(true);
      dragOver.emit(true);
      onDragOver?.(true);
    }

    function onDragOverHandler(event: DragEvent): void {
      if (disabled?.()) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();
      isDragOverState.set(true);
    }

    function onDragLeave(event: DragEvent): void {
      if (disabled?.() || !isDragOverState()) {
        return;
      }

      // if the element we are dragging over is a child of the file dropzone, ignore the event
      if (element.nativeElement.contains(event.relatedTarget as Node)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      isDragOverState.set(false);
      dragOver.emit(false);
      onDragOver?.(false);
    }

    function onDrop(event: DragEvent): void {
      if (disabled?.()) {
        return;
      }

      event.preventDefault();
      isDragOverState.set(false);
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
    listener(element, 'dragenter', onDragEnter);
    listener(element, 'dragover', onDragOverHandler);
    listener(element, 'dragleave', onDragLeave);
    listener(element, 'drop', onDrop);

    return {
      disabled,
      fileTypes,
      multiple,
      directory,
      isDragOver: isDragOverState,
      selected: selected.asObservable(),
      rejected: rejected.asObservable(),
      dragOverChanged: dragOver.asObservable(),
    };
  },
);
