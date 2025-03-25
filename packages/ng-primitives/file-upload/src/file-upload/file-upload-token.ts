/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpFileUpload } from './file-upload';

export const NgpFileUploadToken = new InjectionToken<NgpFileUpload>('NgpFileUploadToken');

/**
 * Inject the FileUpload directive instance
 */
export function injectFileUpload(): NgpFileUpload {
  return inject(NgpFileUploadToken);
}
