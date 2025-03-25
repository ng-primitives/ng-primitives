/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import type { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { injectDisabled, setupHover } from 'ng-primitives/internal';
import { NgpHoverToken } from './hover-token';

/**
 * A directive for normalizing hover events across the different browsers and devices.
 *
 * This is an Angular port of the useHover hook from
 * react-aria: https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/interactions/src/useHover.ts
 */
@Directive({
  selector: '[ngpHover]',
  exportAs: 'ngpHover',
  providers: [{ provide: NgpHoverToken, useExisting: NgpHover }],
})
export class NgpHover {
  /**
   * Whether hoving should be disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpHoverDisabled',
    transform: booleanAttribute,
  });

  /**
   * Access the disabled state from any parent.
   */
  private readonly isDisabled = injectDisabled(this.disabled);

  /**
   * Emit an event when hovering starts.
   */
  readonly hoverStart = output<void>({ alias: 'ngpHoverStart' });

  /**
   * Emit an event when hovering ends.
   */
  readonly hoverEnd = output<void>({ alias: 'ngpHoverEnd' });

  /**
   * Emit an event when the hover state changes.
   */
  readonly hoverChange = output<boolean>({ alias: 'ngpHover' });

  /**
   * Setup the hover state.
   */
  constructor() {
    // setup the hover listener
    setupHover({
      hoverStart: () => {
        this.hoverStart.emit();
        this.hoverChange.emit(true);
      },
      hoverEnd: () => {
        this.hoverEnd.emit();
        this.hoverChange.emit(false);
      },
      disabled: this.isDisabled,
    });
  }
}
