/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { NgpDialogPanelToken } from './dialog-panel-token';

@Directive({
  selector: '[ngpDialogPanel]',
  exportAs: 'ngpDialogPanel',
  providers: [{ provide: NgpDialogPanelToken, useExisting: NgpDialogPanel }],
})
export class NgpDialogPanel {}
