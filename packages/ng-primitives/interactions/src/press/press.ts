import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { ngpPress } from './press-interaction';

// This was inpsired by Headless UI's active-press hook: https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/src/hooks/use-active-press.tsx

/**
 * The `ngpPress` directive listens for press events on an element. This is particularly useful for supporting press events on touch devices, where press events are not handled consistently.
 */
@Directive({
  selector: '[ngpPress]',
  exportAs: 'ngpPress',
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
    ngpPress({
      onPressStart: () => {
        this.pressStart.emit();
        this.pressChange.emit(true);
      },
      onPressEnd: () => {
        this.pressEnd.emit();
        this.pressChange.emit(false);
      },
      disabled: this.disabled,
    });
  }
}
