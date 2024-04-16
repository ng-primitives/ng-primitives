import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, HostListener, booleanAttribute, input, model } from '@angular/core';

@Directive({
  selector: 'button[ngpToggle]',
  exportAs: 'ngpToggle',
  standalone: true,
  host: {
    type: 'button',
    '[attr.aria-pressed]': 'pressed()',
    '[attr.data-state]': 'pressed() ? "on" : "off"',
    '[attr.data-disabled]': 'disabled()',
  },
})
export class NgpToggleDirective {
  /**
   * Whether the toggle is pressed.
   * @default false
   */
  readonly pressed = model<boolean>(false, { alias: 'ngpTogglePressed' });

  /**
   * Whether the toggle is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleDisabled',
    transform: booleanAttribute,
  });

  /**
   * Toggle the pressed state.
   */
  @HostListener('click')
  toggle(): void {
    if (this.disabled()) {
      return;
    }

    this.pressed.set(!this.pressed());
  }
}
