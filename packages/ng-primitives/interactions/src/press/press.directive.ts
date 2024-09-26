/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { injectDisabled, setupPress } from 'ng-primitives/internal';
import { NgpPressToken } from './press.token';

/**
 * This was inpsired by Headless UI's active-press hook:
 * https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/src/hooks/use-active-press.tsx
 */

@Directive({
  standalone: true,
  selector: '[ngpPress]',
  exportAs: 'ngpPress',
  providers: [{ provide: NgpPressToken, useExisting: NgpPress }],
})
export class NgpPress {
  /**
   * Whether listening for press events is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpPressDisabled',
    transform: booleanAttribute,
  });

  /**
   * Access the disabled state from any parent.
   */
  private readonly isDisabled = injectDisabled(this.disabled);

  /**
   * Emit when the press begins.
   */
  readonly pressStart = output<void>({
    alias: 'ngpPressStart',
  });

  /**
   * Emit when the press ends.
   */
  readonly pressEnd = output<void>({
    alias: 'ngpPressEnd',
  });

  /**
   * Emit when the press changes.
   */
  readonly pressChange = output<boolean>({
    alias: 'ngpPress',
  });

  constructor() {
    // setup the press listener
    setupPress({
      pressStart: () => {
        this.pressStart.emit();
        this.pressChange.emit(true);
      },
      pressEnd: () => {
        this.pressEnd.emit();
        this.pressChange.emit(false);
      },
      disabled: this.isDisabled,
    });
  }
}
