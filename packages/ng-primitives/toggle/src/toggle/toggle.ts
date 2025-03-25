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
  output,
} from '@angular/core';
import { provideToggleState, toggleState } from './toggle-state';
import { provideToggle } from './toggle-token';

@Directive({
  selector: '[ngpToggle]',
  exportAs: 'ngpToggle',
  providers: [provideToggle(NgpToggle), provideToggleState()],
  host: {
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.aria-pressed]': 'state.selected()',
    '[attr.data-selected]': 'state.selected() ? "" : null',
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
  readonly selected = input<boolean, BooleanInput>(false, {
    alias: 'ngpToggleSelected',
    transform: booleanAttribute,
  });

  /**
   * Emits when the selected state changes.
   */
  readonly selectedChange = output<boolean>({
    alias: 'ngpToggleSelectedChange',
  });

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
   * The state for the toggle primitive.
   * @internal
   */
  protected readonly state = toggleState({
    selected: this.selected,
    selectedChange: this.selectedChange,
    disabled: this.disabled,
  });

  /**
   * Toggle the selected state.
   */
  @HostListener('click')
  toggle(): void {
    if (this.state.disabled()) {
      return;
    }

    this.state.selected.set(!this.state.selected());
    this.selectedChange.emit(this.state.selected());
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
