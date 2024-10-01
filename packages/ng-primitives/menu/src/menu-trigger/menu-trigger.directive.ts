/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Directive, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgpMenuTriggerToken } from './menu-trigger.token';

@Directive({
  standalone: true,
  selector: '[ngpMenuTrigger]',
  exportAs: 'ngpMenuTrigger',
  providers: [{ provide: NgpMenuTriggerToken, useExisting: NgpMenuTrigger }],
  hostDirectives: [{ directive: CdkMenuTrigger, inputs: ['cdkMenuTriggerFor: ngpMenuTrigger'] }],
  host: {
    '[attr.data-open]': 'open() ? "" : null',
  },
})
export class NgpMenuTrigger {
  /**
   * Access to the underlying `CdkMenuTrigger`.
   */
  private readonly cdkMenuTrigger = inject(CdkMenuTrigger);

  /**
   * Store the open state of the menu.
   */
  protected open = signal<boolean>(false);

  constructor() {
    this.cdkMenuTrigger.opened.pipe(takeUntilDestroyed()).subscribe(() => this.open.set(true));
    this.cdkMenuTrigger.closed.pipe(takeUntilDestroyed()).subscribe(() => this.open.set(false));
  }
}
