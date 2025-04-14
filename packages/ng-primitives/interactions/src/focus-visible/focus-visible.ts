import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { injectDisabled, setupFocusVisible } from 'ng-primitives/internal';
import { NgpFocusVisibleToken } from './focus-visible-token';

/**
 * Apply the `ngpFocusVisible` directive to an element that should be visually focused. This is similar to `ngpFocus`
 * but it will only apply the focus visible styles when the element is focused via keyboard navigation.
 */
@Directive({
  selector: '[ngpFocusVisible]',
  exportAs: 'ngpFocusVisible',
  providers: [{ provide: NgpFocusVisibleToken, useExisting: NgpFocusVisible }],
})
export class NgpFocusVisible {
  /**
   * Whether focus events are listened to.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpFocusVisibleDisabled',
    transform: booleanAttribute,
  });

  /**
   * Access the disabled state from any parent.
   */
  private readonly isDisabled = injectDisabled(this.disabled);

  /**
   * Emit when the element is visually focused.
   */
  readonly focusChange = output<boolean>({
    alias: 'ngpFocusVisible',
  });

  constructor() {
    // setup the focus visible listener
    setupFocusVisible({
      disabled: this.isDisabled,
      focusChange: value => this.focusChange.emit(value),
    });
  }
}
