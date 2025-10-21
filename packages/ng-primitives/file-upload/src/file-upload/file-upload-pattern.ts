import { DOCUMENT } from '@angular/common';
import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding, listener } from 'ng-primitives/state';
import { ngpFileDropzonePattern } from '../file-dropzone/file-dropzone-pattern';

/**
 * The state interface for the FileUpload pattern.
 */
export interface NgpFileUploadState {
  readonly fileTypes: Signal<string[] | undefined>;
  readonly multiple: Signal<boolean>;
  readonly directory: Signal<boolean>;
  readonly dragAndDrop: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly dragOver: Signal<boolean>;
  showFileDialog(): void;
}

/**
 * The props interface for the FileUpload pattern.
 */
export interface NgpFileUploadProps {
  /**
   * The element reference for the file upload.
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
   * Whether to allow the user to select directories.
   */
  readonly directory?: Signal<boolean>;

  /**
   * Whether drag-and-drop is enabled.
   */
  readonly dragAndDrop?: Signal<boolean>;

  /**
   * Defines whether the file upload is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * The event listener for the selected event.
   */
  readonly onSelected?: (files: FileList | null) => void;

  /**
   * The event listener for the canceled event.
   */
  readonly onCanceled?: () => void;

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
 * The FileUpload pattern function.
 */
export function ngpFileUploadPattern({
  element = injectElementRef(),
  fileTypes = signal(undefined),
  multiple = signal(false),
  directory = signal(false),
  dragAndDrop = signal(true),
  disabled = signal(false),
  onSelected,
  onCanceled,
  onRejected,
  onDragOver,
}: NgpFileUploadProps = {}): NgpFileUploadState {
  const document = inject(DOCUMENT);

  // Create file input element
  const input: HTMLInputElement = document.createElement('input');
  input.type = 'file';
  input.addEventListener('change', () => {
    onSelected?.(input.files);
    // clear the input value to allow re-uploading the same file
    input.value = '';
  });
  input.addEventListener('cancel', () => onCanceled?.());

  ngpInteractions({
    element,
    hover: true,
    press: true,
    focusVisible: true,
    disabled,
  });

  // Use the file dropzone pattern for drag-and-drop functionality when enabled
  const pattern = ngpFileDropzonePattern({
    element,
    fileTypes,
    multiple,
    disabled: computed(() => disabled() || !dragAndDrop()),
    onSelected,
    onRejected,
    onDragOver,
  });

  // Host bindings
  dataBinding(element, 'data-disabled', disabled);

  // Event handlers
  function showFileDialog(): void {
    if (disabled()) {
      return;
    }

    const fileTypesValue = fileTypes()?.join(',');

    if (fileTypesValue) {
      input.accept = fileTypesValue;
    }

    input.multiple = multiple();
    input.webkitdirectory = directory();
    input.click();
  }

  // Only add click listener for file dialog, drag-and-drop is handled by dropzone pattern
  listener(element, 'click', showFileDialog);

  return {
    fileTypes,
    multiple,
    directory,
    dragAndDrop,
    disabled,
    dragOver: pattern.dragOver,
    showFileDialog,
  };
}

/**
 * The injection token for the FileUpload pattern.
 */
export const NgpFileUploadPatternToken = new InjectionToken<NgpFileUploadState>(
  'NgpFileUploadPatternToken',
);

/**
 * Injects the FileUpload pattern.
 */
export function injectFileUploadPattern(): NgpFileUploadState {
  return inject(NgpFileUploadPatternToken);
}

/**
 * Provides the FileUpload pattern.
 */
export function provideFileUploadPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpFileUploadState,
): FactoryProvider {
  return { provide: NgpFileUploadPatternToken, useFactory: () => fn(inject(type)) };
}
