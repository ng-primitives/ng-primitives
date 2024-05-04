/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, TemplateRef, ViewContainerRef, effect, inject } from '@angular/core';
import { injectSelect } from '../select/select.token';
import { NgpSelectOptionsToken } from './select-options.token';

@Directive({
  standalone: true,
  selector: '[ngpSelectOptions]',
  exportAs: 'ngpSelectOptions',
  providers: [{ provide: NgpSelectOptionsToken, useExisting: NgpSelectOptionsDirective }],
})
export class NgpSelectOptionsDirective {
  /**
   * Access the parent select component.
   */
  protected readonly select = injectSelect<unknown>();

  /**
   * Access the template ref
   */
  private readonly templateRef = inject(TemplateRef);

  /**
   * Access the viewContainerRef
   */
  private readonly viewContainerRef = inject(ViewContainerRef);

  constructor() {
    // show or hide the options based on the select open state
    effect(() => {
      if (this.select.open()) {
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainerRef.clear();
      }
    });
  }
}
