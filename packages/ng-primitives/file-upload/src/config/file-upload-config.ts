import { InjectionToken, Provider, inject } from '@angular/core';

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
