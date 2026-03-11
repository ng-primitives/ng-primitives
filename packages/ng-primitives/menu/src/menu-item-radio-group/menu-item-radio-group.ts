import { Directive, input, output } from '@angular/core';
import {
  ngpMenuItemRadioGroup,
  provideMenuItemRadioGroupState,
} from './menu-item-radio-group-state';

/**
 * The `NgpMenuItemRadioGroup` directive represents a group of radio menu items.
 */
@Directive({
  selector: '[ngpMenuItemRadioGroup]',
  exportAs: 'ngpMenuItemRadioGroup',
  providers: [provideMenuItemRadioGroupState()],
})
export class NgpMenuItemRadioGroup {
  /** The current value of the radio group */
  readonly value = input<string | null>(null, {
    alias: 'ngpMenuItemRadioGroupValue',
  });

  /** Event emitted when the value changes */
  readonly valueChange = output<string>({
    alias: 'ngpMenuItemRadioGroupValueChange',
  });

  constructor() {
    ngpMenuItemRadioGroup({
      value: this.value,
      onValueChange: value => this.valueChange.emit(value),
    });
  }
}
