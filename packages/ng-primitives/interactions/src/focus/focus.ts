import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { setupFocus } from 'ng-primitives/internal';

/**
 * This was inspired by the React Aria useFocus hook.
 * https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/interactions/src/useFocus.ts#L20
 */
@Directive({
  selector: '[ngpFocus]',
  exportAs: 'ngpFocus',
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
   * Emit when the focus state changes.
   */
  readonly focus = output<boolean>({ alias: 'ngpFocus' });

  constructor() {
    // setup the focus listener
    setupFocus({
      disabled: this.disabled,
      focus: () => this.focus.emit(true),
      blur: () => this.focus.emit(false),
    });
  }
}
