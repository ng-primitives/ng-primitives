/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { CdkMenuTrigger } from '@angular/cdk/menu';
import { Directive, effect, inject, input, signal, TemplateRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[ngpMenuTrigger]',
  exportAs: 'ngpMenuTrigger',
  hostDirectives: [{ directive: CdkMenuTrigger }],
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
   * Template reference variable to the menu this trigger opens
   */
  public readonly menu = input.required<TemplateRef<unknown>>({
    alias: 'ngpMenuTrigger',
  });

  /**
   * Store the open state of the menu.
   */
  protected readonly open = signal<boolean>(false);

  constructor() {
    this.cdkMenuTrigger.opened.pipe(takeUntilDestroyed()).subscribe(() => this.open.set(true));
    this.cdkMenuTrigger.closed.pipe(takeUntilDestroyed()).subscribe(() => this.open.set(false));

    // forward the template ref to the host directive anytime it changes
    effect(() => (this.cdkMenuTrigger.menuTemplateRef = this.menu()));
  }
}
