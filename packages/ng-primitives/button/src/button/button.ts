import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, ElementRef, inject, input } from '@angular/core';
import { setupInteractions } from 'ng-primitives/internal';
import { buttonState, provideButtonState } from './button-state';

@Directive({
  selector: '[ngpButton]',
  exportAs: 'ngpButton',
  providers: [provideButtonState()],
  host: {
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '[attr.disabled]': 'isButton && state.disabled() ? true : null',
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
    transform: booleanAttribute,
  });

  /**
   * Detect if this is an HTML button element.
   */
  protected readonly isButton = this.elementRef.nativeElement.tagName.toLowerCase() === 'button';

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
