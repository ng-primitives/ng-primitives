import { Directive, input, output } from '@angular/core';
import { ngpMenuItemRadioGroup, provideMenuItemRadioGroupState } from 'ng-primitives/menu';

/**
 * The `NgpContextMenuItemRadioGroup` directive represents a group of radio context menu items.
 */
@Directive({
  selector: '[ngpContextMenuItemRadioGroup]',
  exportAs: 'ngpContextMenuItemRadioGroup',
  providers: [provideMenuItemRadioGroupState()],
})
export class NgpContextMenuItemRadioGroup {
  /** The current value of the radio group */
  readonly value = input<string | null>(null, {
    alias: 'ngpContextMenuItemRadioGroupValue',
  });

  /** Event emitted when the value changes */
  readonly valueChange = output<string>({
    alias: 'ngpContextMenuItemRadioGroupValueChange',
  });

  constructor() {
    ngpMenuItemRadioGroup({
      value: this.value,
      onValueChange: value => this.valueChange.emit(value),
    });
  }
}
