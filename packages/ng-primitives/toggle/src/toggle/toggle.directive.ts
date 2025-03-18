/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import {
  Directive,
  ElementRef,
  HostListener,
  booleanAttribute,
  inject,
  input,
  model,
} from '@angular/core';
import { controlState, provideControlState } from 'ng-primitives/forms';
import { provideToggle } from './toggle.token';

@Directive({
  selector: '[ngpToggle]',
  exportAs: 'ngpToggle',
  providers: [provideToggle(NgpToggle), provideControlState()],
  host: {
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.aria-pressed]': 'state.value()',
    '[attr.data-selected]': 'state.value() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
})
export class NgpToggle {
  /**
   * Access the element.
   */
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Whether the toggle is selected.
   * @default false
   */
  readonly selected = model<boolean>(false, { alias: 'ngpToggleSelected' });

  /**
   * Whether the toggle is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleDisabled',
    transform: booleanAttribute,
  });

  /**
   * Determine if the element is a button.
   */
  protected isButton = this.element.nativeElement.tagName === 'BUTTON';

  /**
   * The form control state. This is used to allow communication between the toggle and the control value access and any
   * components that use this as a host directive.
   * @internal
   */
  readonly state = controlState({
    value: this.selected,
    disabled: this.disabled,
  });

  /**
   * Toggle the selected state.
   */
  @HostListener('click')
  toggle(): void {
    if (this.disabled()) {
      return;
    }

    this.state.setValue(!this.state.value());
  }

  /**
   * If the element is not a button or a link the space key should toggle the selected state.
   */
  @HostListener('keydown.space', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    if (!this.isButton && this.element.nativeElement.tagName !== 'A') {
      event.preventDefault();
      this.toggle();
    }
  }
}
