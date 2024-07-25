/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, ElementRef, booleanAttribute, inject, input } from '@angular/core';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { NgpButtonToken } from './button.token';

@Directive({
  standalone: true,
  selector: '[ngpButton]',
  exportAs: 'ngpButton',
  providers: [
    { provide: NgpButtonToken, useExisting: NgpButton },
    { provide: NgpDisabledToken, useExisting: NgpButton },
  ],
  hostDirectives: [NgpHover, NgpFocusVisible, NgpPress],
  host: {
    '[attr.data-disabled]': 'disabled()',
    '[attr.disabled]': 'isButton && disabled() ? true : null',
  },
})
export class NgpButton implements NgpCanDisable {
  /**
   * Get the native element of the button.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Whether the button is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Detect if this is an HTML button element.
   */
  protected readonly isButton = this.elementRef.nativeElement.tagName.toLowerCase() === 'button';
}
