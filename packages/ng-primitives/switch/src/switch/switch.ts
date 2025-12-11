import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpSwitch, provideSwitchState } from './switch-state';

/**
 * Apply the `ngpSwitch` directive to an element to manage the checked state.
 */
@Directive({
  selector: '[ngpSwitch]',
  exportAs: 'ngpSwitch',
  providers: [provideSwitchState({ inherit: false })],
})
export class NgpSwitch {
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
  readonly state = ngpSwitch({
    id: this.id,
    checked: this.checked,
    disabled: this.disabled,
    onCheckedChange: value => this.checkedChange.emit(value),
  });

  /**
   * Toggle the checked state.
   */
  toggle(): void {
    this.state.toggle();
  }

  /**
   * Update the checked value.
   */
  setChecked(value: boolean): void {
    this.state.setChecked(value);
  }

  /**
   * Update the disabled value.
   */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }
}
