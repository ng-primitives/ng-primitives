/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { NgpDialogOverlayToken } from './dialog-overlay.token';

@Directive({
  standalone: true,
  selector: '[ngpDialogOverlay]',
  exportAs: 'ngpDialogOverlay',
  providers: [{ provide: NgpDialogOverlayToken, useExisting: NgpDialogOverlay }],
})
export class NgpDialogOverlay {}
