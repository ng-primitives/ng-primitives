import { InjectionToken, Provider, inject } from '@angular/core';

export interface NgpFileDropzoneConfig {
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
   * Whether the file dropzone is disabled.
   * @default false
   */
  disabled: boolean;
}

export const defaultFileDropzoneConfig: NgpFileDropzoneConfig = {
  fileTypes: undefined,
  multiple: false,
  directory: false,
  disabled: false,
};

export const NgpFileDropzoneConfigToken = new InjectionToken<NgpFileDropzoneConfig>(
  'NgpFileDropzoneConfigToken',
);

/**
 * Provide the default File Dropzone configuration
 * @param config The File Dropzone configuration
 * @returns The provider
 */
export function provideFileDropzoneConfig(config: Partial<NgpFileDropzoneConfig>): Provider[] {
  return [
    {
      provide: NgpFileDropzoneConfigToken,
      useValue: { ...defaultFileDropzoneConfig, ...config },
    },
  ];
}

/**
 * Inject the File Dropzone configuration
 * @returns The global File Dropzone configuration
 */
export function injectFileDropzoneConfig(): NgpFileDropzoneConfig {
  return inject(NgpFileDropzoneConfigToken, { optional: true }) ?? defaultFileDropzoneConfig;
}
