/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, HostListener, booleanAttribute, input, output, signal } from '@angular/core';
import { injectDisabled } from 'ng-primitives/internal';
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
  host: {
    '[attr.data-focus]': 'isFocused()',
  },
})
export class NgpFocus {
  /**
   * Whether the element is currently focused.
   */
  protected isFocused = signal<boolean>(false);

  /**
   * Access the disabled state from any parent.
   */
  private readonly disabledContext = injectDisabled();

  /**
   * Whether listening for focus events is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpFocusDisabled',
    transform: booleanAttribute,
  });

  /**
   * Emit when the focus state changes.
   */
  readonly focus = output<boolean>({ alias: 'ngpFocus' });

  /**
   * Listen for focus events.
   * @param event
   */
  @HostListener('focus', ['$event'])
  protected onFocus(event: FocusEvent) {
    if (this.disabled() || this.disabledContext()) {
      return;
    }

    const ownerDocument = (event.target as HTMLElement)?.ownerDocument ?? document;

    // ensure this element is still focused
    if (ownerDocument.activeElement === event.target && event.currentTarget === event.target) {
      this.focus.emit(true);
      this.isFocused.set(true);
    }
  }

  /**
   * Listen for blur events.
   * @param event
   */
  @HostListener('blur', ['$event'])
  protected onBlur(event: FocusEvent) {
    if (this.disabled() || this.disabledContext()) {
      return;
    }

    if (event.currentTarget === event.target) {
      this.focus.emit(false);
      this.isFocused.set(false);
    }
  }
}
