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

@Directive({
  selector: '[ngpToggle]',
  exportAs: 'ngpToggle',
  standalone: true,
  host: {
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.aria-pressed]': 'selected()',
    '[attr.data-selected]': 'selected() ? "" : null',
    '[attr.data-disabled]': 'disabled() ? "" : null',
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
   * Toggle the selected state.
   */
  @HostListener('click')
  toggle(): void {
    if (this.disabled()) {
      return;
    }

    this.selected.update(selected => !selected);
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
