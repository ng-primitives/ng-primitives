/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { CdkMenu } from '@angular/cdk/menu';
import { Directive } from '@angular/core';
import { NgpMenuToken } from './menu-token';

@Directive({
  selector: '[ngpMenu]',
  exportAs: 'ngpMenu',
  providers: [{ provide: NgpMenuToken, useExisting: NgpMenu }],
  hostDirectives: [CdkMenu],
})
export class NgpMenu {}
