import { InjectionToken, Provider, inject } from '@angular/core';
import type { NgpFilePasteTarget } from '../file-dropzone/file-drop-filter';

export interface NgpFileUploadConfig {
  /**
   * The accepted file types, either file extensions (e.g. `.jpg`) or MIME types (e.g. `image/jpeg`).
   * @default undefined
   */
  fileTypes: string[] | undefined;
  /**
   * Whether to allow multiple files to be selected.
   * @default false
   */
  multiple: boolean;
  /**
   * Whether to allow the user to select directories.
   * @default false
   */
  directory: boolean;
  /**
   * The maximum size of each file in bytes.
   * @default undefined
   */
  maxFileSize?: number;
  /**
   * Where pasted files are captured: `'host'` while the element is focused, `'document'` anywhere
   * on the page, or `false` to ignore pastes.
   * @default false
   */
  paste?: NgpFilePasteTarget;
  /**
   * Whether drag-and-drop is enabled.
   * @default true
   */
  dragAndDrop: boolean;
  /**
   * Whether the file upload is disabled.
   * @default false
   */
  disabled: boolean;
}

export const defaultFileUploadConfig: NgpFileUploadConfig = {
  fileTypes: undefined,
  multiple: false,
  directory: false,
  maxFileSize: undefined,
  paste: false,
  dragAndDrop: true,
  disabled: false,
};

export const NgpFileUploadConfigToken = new InjectionToken<NgpFileUploadConfig>(
  'NgpFileUploadConfigToken',
);

/**
 * Provide the default File Upload configuration
 * @param config The File Upload configuration
 * @returns The provider
 */
export function provideFileUploadConfig(config: Partial<NgpFileUploadConfig>): Provider[] {
  return [
    {
      provide: NgpFileUploadConfigToken,
      useValue: { ...defaultFileUploadConfig, ...config },
    },
  ];
}

/**
 * Inject the File Upload configuration
 * @returns The global File Upload configuration
 */
export function injectFileUploadConfig(): NgpFileUploadConfig {
  return inject(NgpFileUploadConfigToken, { optional: true }) ?? defaultFileUploadConfig;
}
