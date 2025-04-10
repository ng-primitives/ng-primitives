import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, input, output } from '@angular/core';
import { injectDisabled, setupFocusVisible } from 'ng-primitives/internal';
import { NgpFocusVisibleToken } from './focus-visible-token';

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
