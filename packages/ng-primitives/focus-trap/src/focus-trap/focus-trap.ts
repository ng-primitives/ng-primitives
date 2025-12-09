import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
import { ngpFocusTrap, provideFocusTrapState } from './focus-trap-state';

/**
 * This implementation is based on the Radix UI FocusScope:
 * https://github.com/radix-ui/primitives/blob/main/packages/react/focus-scope/src/FocusScope.tsx#L306
 */

/**
 * The `NgpFocusTrap` directive traps focus within the host element.
 */
@Directive({
  selector: '[ngpFocusTrap]',
  exportAs: 'ngpFocusTrap',
  providers: [provideFocusTrapState()],
})
export class NgpFocusTrap {
  /**
   * Whether the focus trap is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpFocusTrapDisabled',
    transform: booleanAttribute,
  });

  /**
   * The focus trap state.
   */
  constructor() {
    ngpFocusTrap({ disabled: this.disabled });
  }
}
