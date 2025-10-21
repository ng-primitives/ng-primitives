import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { ngpHoverInteraction } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding, listener } from 'ng-primitives/state';
import { fileDropFilter } from './file-drop-filter';

/**
 * The state interface for the FileDropzone pattern.
 */
export interface NgpFileDropzoneState {
  readonly fileTypes: Signal<string[] | undefined>;
  readonly multiple: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly dragOver: Signal<boolean>;
}

/**
 * The props interface for the FileDropzone pattern.
 */
export interface NgpFileDropzoneProps {
  /**
   * The element reference for the file dropzone.
   */
  readonly element?: ElementRef<HTMLElement>;

  /**
   * The accepted file types.
   */
  readonly fileTypes?: Signal<string[] | undefined>;

  /**
   * Whether to allow multiple files to be selected.
   */
  readonly multiple?: Signal<boolean>;

  /**
   * Defines whether the file dropzone is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * The event listener for the selected event.
   */
  readonly onSelected?: (files: FileList | null) => void;

  /**
   * The event listener for the rejected event.
   */
  readonly onRejected?: () => void;

  /**
   * The event listener for the drag over event.
   */
  readonly onDragOver?: (isDragOver: boolean) => void;
}

/**
 * The FileDropzone pattern function.
 */
export function ngpFileDropzonePattern({
  element = injectElementRef(),
  fileTypes = signal(undefined),
  multiple = signal(false),
  disabled = signal(false),
  onSelected,
  onRejected,
  onDragOver,
}: NgpFileDropzoneProps = {}): NgpFileDropzoneState {
  const dragOver = signal(false);

  ngpHoverInteraction({ element, disabled });

  // Host bindings
  dataBinding(element, 'data-dragover', dragOver);
  dataBinding(element, 'data-disabled', disabled);

  // Event handlers
  function handleDragEnter(event: DragEvent): void {
    if (disabled()) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  }

  function handleDragOver(event: DragEvent): void {
    if (disabled()) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave(event: DragEvent): void {
    if (disabled() || !dragOver()) {
      return;
    }

    // if the element we are dragging over is a child of the file upload, ignore the event
    if (element.nativeElement.contains(event.relatedTarget as Node)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  }

  function handleDrop(event: DragEvent): void {
    if (disabled()) {
      return;
    }

    event.preventDefault();
    setDragOver(false);

    const fileList = event.dataTransfer?.files;
    if (fileList) {
      const filteredFiles = fileDropFilter(fileList, fileTypes(), multiple());
      if (filteredFiles) {
        onSelected?.(filteredFiles);
      } else {
        onRejected?.();
      }
    }
  }

  function setDragOver(value: boolean): void {
    dragOver.set(value);
    onDragOver?.(value);
  }

  // Host listeners
  listener(element, 'dragenter', handleDragEnter);
  listener(element, 'dragover', handleDragOver);
  listener(element, 'dragleave', handleDragLeave);
  listener(element, 'drop', handleDrop);

  return {
    fileTypes,
    multiple,
    disabled,
    dragOver,
  };
}

/**
 * The injection token for the FileDropzone pattern.
 */
export const NgpFileDropzonePatternToken = new InjectionToken<NgpFileDropzoneState>(
  'NgpFileDropzonePatternToken',
);

/**
 * Injects the FileDropzone pattern.
 */
export function injectFileDropzonePattern(): NgpFileDropzoneState {
  return inject(NgpFileDropzonePatternToken);
}

/**
 * Provides the FileDropzone pattern.
 */
export function provideFileDropzonePattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpFileDropzoneState,
): FactoryProvider {
  return { provide: NgpFileDropzonePatternToken, useFactory: () => fn(inject(type)) };
}
