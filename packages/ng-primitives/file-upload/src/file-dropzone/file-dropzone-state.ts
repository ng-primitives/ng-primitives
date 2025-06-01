import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpFileDropzone } from './file-dropzone';

/**
 * The state token  for the FileDropzone primitive.
 */
export const NgpFileDropzoneStateToken = createStateToken<NgpFileDropzone>('FileDropzone');

/**
 * Provides the FileDropzone state.
 */
export const provideFileDropzoneState = createStateProvider(NgpFileDropzoneStateToken);

/**
 * Injects the FileDropzone state.
 */
export const injectFileDropzoneState =
  createStateInjector<NgpFileDropzone>(NgpFileDropzoneStateToken);

/**
 * The FileDropzone state registration function.
 */
export const fileDropzoneState = createState(NgpFileDropzoneStateToken);
