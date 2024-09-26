/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { injectDisabled, setupFocus } from 'ng-primitives/internal';
import { NgpFocusToken } from './focus.token';

/**
 * This was inspired by the React Aria useFocus hook.
 * https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/interactions/src/useFocus.ts#L20
 */
@Directive({
  standalone: true,
  selector: '[ngpFocus]',
  exportAs: 'ngpFocus',
  providers: [{ provide: NgpFocusToken, useExisting: NgpFocus }],
})
export class NgpFocus {
  /**
   * Whether listening for focus events is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpFocusDisabled',
    transform: booleanAttribute,
  });

  /**
   * Access the disabled state from any parent.
   */
  private readonly isDisabled = injectDisabled(this.disabled);

  /**
   * Emit when the focus state changes.
   */
  readonly focus = output<boolean>({ alias: 'ngpFocus' });

  constructor() {
    // setup the focus listener
    setupFocus({
      disabled: this.isDisabled,
      focus: () => this.focus.emit(true),
      blur: () => this.focus.emit(false),
    });
  }
}
