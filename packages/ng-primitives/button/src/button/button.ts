import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, HOST_TAG_NAME, inject, input } from '@angular/core';
import { setupInteractions } from 'ng-primitives/internal';
import { buttonState, provideButtonState } from './button-state';

@Directive({
  selector: '[ngpButton]',
  exportAs: 'ngpButton',
  providers: [provideButtonState({ inherit: false })],
  host: {
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '[attr.disabled]': 'isButton && state.disabled() ? true : null',
  },
})
export class NgpButton {
  /**
   * Get the tag name of the element.
   */
  private readonly tagName = inject(HOST_TAG_NAME);

  /**
   * Whether the button is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    transform: booleanAttribute,
  });

  /**
   * Detect if this is an HTML button element.
   */
  protected readonly isButton = this.tagName.toLowerCase() === 'button';

  /**
   * The button state.
   */
  protected readonly state = buttonState<NgpButton>(this);

  constructor() {
    // setup the hover, press, and focus-visible listeners
    setupInteractions({
      disabled: this.state.disabled,
      hover: true,
      press: true,
      focusVisible: true,
    });
  }
}
