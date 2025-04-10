import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, HostListener, input, output } from '@angular/core';
import { NgpFormControl } from 'ng-primitives/form-field';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { injectElementRef, NgpCanDisable, NgpDisabledToken } from 'ng-primitives/internal';
import { provideSwitchState, switchState } from './switch-state';
import { provideSwitch } from './switch-token';

@Directive({
  selector: '[ngpSwitch]',
  exportAs: 'ngpSwitch',
  providers: [
    provideSwitch(NgpSwitch),
    provideSwitchState(),
    { provide: NgpDisabledToken, useExisting: NgpSwitch },
  ],
  hostDirectives: [NgpFormControl, NgpHover, NgpPress, NgpFocusVisible],
  host: {
    role: 'switch',
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.aria-checked]': 'state.checked()',
    '[attr.data-checked]': 'state.checked() ? "" : null',
    '[attr.disabled]': 'isButton && state.disabled() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '[attr.aria-disabled]': 'state.disabled()',
    '[attr.tabindex]': 'state.disabled() ? -1 : 0',
  },
})
export class NgpSwitch implements NgpCanDisable {
  /**
   * Access the element ref.
   */
  private readonly elementRef = injectElementRef();

  /**
   * Determine if the switch is a button
   */
  protected isButton = this.elementRef.nativeElement.tagName === 'BUTTON';

  /**
   * Determine if the switch is checked.
   * @default false
   */
  readonly checked = input<boolean, BooleanInput>(false, {
    alias: 'ngpSwitchChecked',
    transform: booleanAttribute,
  });

  /**
   * Emits when the checked state changes.
   */
  readonly checkedChange = output<boolean>({
    alias: 'ngpSwitchCheckedChange',
  });

  /**
   * Determine if the switch is disabled.
   * @default false
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpSwitchDisabled',
    transform: booleanAttribute,
  });

  /**
   * The switch state.
   * @internal
   */
  readonly state = switchState<NgpSwitch>(this);

  /**
   * Toggle the checked state.
   */
  @HostListener('click')
  toggle(): void {
    if (this.state.disabled()) {
      return;
    }

    this.state.checked.set(!this.state.checked());
    this.checkedChange.emit(this.state.checked());
  }

  /**
   * Handle the keydown event.
   */
  @HostListener('keydown.space')
  protected onKeyDown(): void {
    // If the switch is not a button then the space key will not toggle the checked state automatically,
    // so we need to do it manually.
    if (!this.isButton) {
      this.toggle();
    }
  }
}
