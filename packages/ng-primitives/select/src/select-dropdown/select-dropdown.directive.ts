/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { DomPortalOutlet, TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  EmbeddedViewRef,
  inject,
  Injector,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { autoUpdate, computePosition } from '@floating-ui/dom';
import { onChange } from 'ng-primitives/utils';
import { injectSelect } from '../select/select.token';
import { NgpSelectDropdownToken } from './select-dropdown.token';

@Directive({
  standalone: true,
  selector: '[ngpSelectDropdown]',
  exportAs: 'ngpSelectDropdown',
  providers: [{ provide: NgpSelectDropdownToken, useExisting: NgpSelectDropdown }],
})
export class NgpSelectDropdown implements OnDestroy {
  /**
   * Access the select instance.
   */
  private readonly select = injectSelect();

  /**
   * Access the injector.
   */
  private readonly injector = inject(Injector);

  /**
   * Access the view container ref.
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

  /**
   * Access the TemplateRef.
   */
  private readonly template = inject<TemplateRef<void>>(TemplateRef);

  /**
   * The view ref of the select dropdown.
   */
  private viewRef?: EmbeddedViewRef<void>;

  /**
   * The dispose function.
   */
  private dispose?: () => void;

  constructor() {
    // Show or hide the select dropdown based on the open state.
    onChange(this.select.open, open => (open ? this.show() : this.hide()));
  }

  ngOnDestroy(): void {
    this.hide();
  }

  /**
   * Show the select dropdown.
   */
  private show(): void {
    const portal = new TemplatePortal(
      this.template,
      this.viewContainerRef,
      undefined,
      this.injector,
    );

    const domOutlet = new DomPortalOutlet(
      document.body,
      undefined,
      undefined,
      Injector.create({
        parent: this.injector,
        providers: [],
      }),
    );

    this.viewRef = domOutlet.attach(portal);
    this.viewRef.detectChanges();

    const outletElement = this.viewRef.rootNodes[0];

    this.dispose = autoUpdate(
      this.select.button().element.nativeElement,
      outletElement,
      async () => {
        const position = await computePosition(
          this.select.button().element.nativeElement,
          outletElement,
          {
            placement: 'bottom-start',
            middleware: [],
          },
        );

        this.select.dropdownBounds.update(bounds => ({
          ...bounds,
          x: position.x,
          y: position.y,
        }));
      },
    );
  }

  /**
   * Hide the select dropdown.
   */
  private hide(): void {
    this.dispose?.();
    this.viewRef?.destroy();
  }
}
