import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, HostListener, input, output } from '@angular/core';
import { setupFormControl } from 'ng-primitives/form-field';
import { injectElementRef, setupInteractions } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { provideSwitchState, switchState } from './switch-state';

/**
 * Apply the `ngpSwitch` directive to an element to manage the checked state.
 */
@Directive({
  selector: '[ngpSwitch]',
  exportAs: 'ngpSwitch',
  providers: [provideSwitchState()],
  host: {
    role: 'switch',
    '[id]': 'id()',
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.aria-checked]': 'state.checked()',
    '[attr.data-checked]': 'state.checked() ? "" : null',
    '[attr.disabled]': 'isButton && state.disabled() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '[attr.aria-disabled]': 'state.disabled()',
    '[attr.tabindex]': 'state.disabled() ? -1 : 0',
  },
})
export class NgpSwitch {
  /**
   * Access the element ref.
   */
  private readonly elementRef = injectElementRef();

  /**
   * Determine if the switch is a button
   */
  protected isButton = this.elementRef.nativeElement.tagName === 'BUTTON';

  /**
   * The id of the switch. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-switch'));

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

  constructor() {
    setupInteractions({
      hover: true,
      press: true,
      focusVisible: true,
      disabled: this.state.disabled,
    });
    setupFormControl({ id: this.state.id, disabled: this.state.disabled });
  }

  /**
   * Toggle the checked state.
   */
  @HostListener('click')
  toggle(): void {
    if (this.state.disabled()) {
      return;
    }

    const checked = !this.state.checked();
    this.state.checked.set(checked);
    this.checkedChange.emit(checked);
  }

  /**
   * Handle the keydown event.
   */
  @HostListener('keydown.space', ['$event'])
  protected onKeyDown(event: KeyboardEvent): void {
    // Prevent the default action of the space key, which is to scroll the page.
    event.preventDefault();

    // If the switch is not a button then the space key will not toggle the checked state automatically,
    // so we need to do it manually.
    if (!this.isButton) {
      this.toggle();
    }
  }
}
