import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpFileUpload } from './file-upload';

/**
 * The state token  for the FileUpload primitive.
 */
export const NgpFileUploadStateToken = createStateToken<NgpFileUpload>('FileUpload');

/**
 * Provides the FileUpload state.
 */
export const provideFileUploadState = createStateProvider(NgpFileUploadStateToken);

/**
 * Injects the FileUpload state.
 */
export const injectFileUploadState = createStateInjector(NgpFileUploadStateToken);

/**
 * The FileUpload state registration function.
 */
export const fileUploadState = createState(NgpFileUploadStateToken);
