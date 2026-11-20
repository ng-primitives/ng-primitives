import { Signal, signal } from '@angular/core';
import { ngpHover } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  controlled,
  createPrimitive,
  dataBinding,
  deprecatedSetter,
  emitter,
  listener,
} from 'ng-primitives/state';
import { Observable } from 'rxjs';
import {
  filesToFileList,
  NgpFilePasteTarget,
  NgpFileRejection,
  validateFiles,
} from './file-drop-filter';
import { filePaste } from './file-paste';

/**
 * The state for the NgpFileDropzone directive.
 */
export interface NgpFileDropzoneState {
  /**
   * Whether the file dropzone is disabled.
   */
  readonly disabled: Signal<boolean | undefined>;
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
   * Observable that emits every file that failed validation, and why.
   */
  readonly rejectedFiles: Observable<NgpFileRejection[]>;
  /**
   * Observable that emits when drag over state changes.
   */
  readonly dragOver: Observable<boolean>;

  /**
   * Set the accepted file types.
   */
  readonly fileTypes: Signal<string[] | undefined>;
  /**
   * Whether multiple files can be selected.
   */
  readonly multiple: Signal<boolean | undefined>;
  /**
   * Whether directories can be selected.
   */
  readonly directory: Signal<boolean | undefined>;

  /**
   * Set the disabled state.
   */
  setDisabled(value: boolean): void;
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
   * The maximum size of each file in bytes.
   */
  readonly maxFileSize?: Signal<number | undefined>;
  /**
   * Where pasted files are captured.
   */
  readonly paste?: Signal<NgpFilePasteTarget>;
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
   * Callback with every file that failed validation, and why.
   */
  readonly onRejectedFiles?: (rejections: NgpFileRejection[]) => void;
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
    fileTypes = signal<string[] | undefined>(undefined),
    multiple = signal<boolean>(false),
    directory = signal<boolean>(false),
    maxFileSize = signal<number | undefined>(undefined),
    paste = signal<NgpFilePasteTarget>(false),
    disabled: _disabled = signal<boolean>(false),
    onSelected,
    onRejected,
    onRejectedFiles,
    onDragOver,
  }: NgpFileDropzoneProps) => {
    const element = injectElementRef();
    const isDragOverState = signal(false);

    // Controlled properties
    const disabled = controlled(_disabled);

    // Create observables
    const selected = emitter<FileList | null>();
    const rejected = emitter<void>();
    const rejectedFiles = emitter<NgpFileRejection[]>();
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
        selectFiles(fileList);
      }
    }

    function selectFiles(fileList: FileList): void {
      const { accepted, rejections } = validateFiles(fileList, {
        fileTypes: fileTypes(),
        maxFileSize: maxFileSize(),
        multiple: multiple(),
      });

      if (accepted.length) {
        const files = filesToFileList(accepted);
        selected.emit(files);
        onSelected?.(files);
      } else {
        rejected.emit();
        onRejected?.();
      }

      if (rejections.length) {
        rejectedFiles.emit(rejections);
        onRejectedFiles?.(rejections);
      }
    }

    // Event listeners
    listener(element, 'dragenter', onDragEnter);
    listener(element, 'dragover', onDragOverHandler);
    listener(element, 'dragleave', onDragLeave);
    listener(element, 'drop', onDrop);

    filePaste(element, paste, disabled, selectFiles);

    function setDisabled(value: boolean): void {
      disabled?.set(value);
    }

    return {
      disabled: deprecatedSetter(disabled, 'setDisabled', setDisabled),
      fileTypes,
      multiple,
      directory,
      isDragOver: isDragOverState,
      selected: selected.asObservable(),
      rejected: rejected.asObservable(),
      rejectedFiles: rejectedFiles.asObservable(),
      dragOver: dragOver.asObservable(),
      setDisabled,
    } satisfies NgpFileDropzoneState;
  },
);
