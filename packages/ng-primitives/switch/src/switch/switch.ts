import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, output } from '@angular/core';
import { SetterOptions } from 'ng-primitives/state';
import { coerceBooleanOrUndefined, uniqueId } from 'ng-primitives/utils';
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
   * Determine if the switch is checked. When defined the switch is controlled.
   */
  readonly checked = input<boolean | undefined, BooleanInput>(undefined, {
    alias: 'ngpSwitchChecked',
    transform: coerceBooleanOrUndefined,
  });

  /**
   * The default checked state for uncontrolled usage.
   * @default false
   */
  readonly defaultChecked = input<boolean, BooleanInput>(false, {
    alias: 'ngpSwitchDefaultChecked',
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
   * Whether the switch is required.
   * @default false
   */
  readonly required = input<boolean, BooleanInput>(false, {
    alias: 'ngpSwitchRequired',
    transform: booleanAttribute,
  });

  /**
   * The switch state.
   * @internal
   */
  readonly state = ngpSwitch({
    id: this.id,
    checked: this.checked,
    defaultChecked: this.defaultChecked,
    disabled: this.disabled,
    required: this.required,
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
  setChecked(value: boolean, options?: SetterOptions): void {
    this.state.setChecked(value, options);
  }

  /**
   * Update the disabled value.
   */
  setDisabled(value: boolean): void {
    this.state.setDisabled(value);
  }
}
