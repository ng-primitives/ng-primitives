/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  HostListener,
  inject,
  Injector,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { NgpButton } from 'ng-primitives/button';
import { NgpDialogTriggerToken } from './dialog-trigger.token';

@Directive({
  standalone: true,
  selector: '[ngpDialogTrigger]',
  exportAs: 'ngpDialogTrigger',
  providers: [{ provide: NgpDialogTriggerToken, useExisting: NgpDialogTrigger }],
  hostDirectives: [NgpButton],
})
export class NgpDialogTrigger {
  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the CDK overlay service.
   */
  private readonly overlay = inject(Overlay);

  /**
   * Access the view container ref.
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /**
   * The template to launch.
   */
  readonly template = input.required<TemplateRef<unknown>>({
    alias: 'ngpDialogTrigger',
  });

  /**
   * Store the overlay ref instance.
   * @internal
   */
  overlayRef: OverlayRef | null = null;

  @HostListener('click')
  protected launch(): void {
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      disposeOnNavigation: true,
      hasBackdrop: false,
    });

    this.overlayRef.attach(
      new TemplatePortal(
        this.template(),
        this.viewContainerRef,
        {
          close: () => this.overlayRef?.dispose(),
        },
        Injector.create({
          providers: [{ provide: NgpDialogTriggerToken, useExisting: NgpDialogTrigger }],
          parent: this.injector,
        }),
      ),
    );
  }
}
