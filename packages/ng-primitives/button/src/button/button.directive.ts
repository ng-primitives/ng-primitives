/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, ElementRef, booleanAttribute, inject, input, output } from '@angular/core';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { NgpButtonToken } from './button.token';

@Directive({
  standalone: true,
  selector: '[ngpButton]',
  exportAs: 'ngpButton',
  providers: [{ provide: NgpButtonToken, useExisting: NgpButton }],
  hostDirectives: [
    { directive: NgpHover, inputs: ['ngpHoverDisabled:ngpButtonDisabled'] },
    {
      directive: NgpPress,
      inputs: ['ngpPressDisabled:ngpButtonDisabled'],
      outputs: ['ngpPressEnd:ngpButtonPress'],
    },
    { directive: NgpFocusVisible, inputs: ['ngpFocusVisibleDisabled:ngpButtonDisabled'] },
  ],
  host: {
    '[attr.data-disabled]': 'disabled()',
    '[attr.disabled]': 'isButton && disabled() ? true : null',
  },
})
export class NgpButton {
  /**
   * Get the native element of the button.
   */
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Whether the button is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpButtonDisabled',
    transform: booleanAttribute,
  });

  /**
   * Emit whenever the button is pressed.
   */
  readonly pressEnd = output<void>({
    alias: 'ngpButtonPress',
  });

  /**
   * Detect if this is an HTML button element.
   */
  private readonly isButton = this.elementRef.nativeElement.tagName.toLowerCase() === 'button';
}
