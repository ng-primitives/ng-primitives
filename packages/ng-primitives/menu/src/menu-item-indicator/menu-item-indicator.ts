import { computed, Directive } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';
import { injectMenuItemCheckboxState } from '../menu-item-checkbox/menu-item-checkbox-state';
import { injectMenuItemRadioState } from '../menu-item-radio/menu-item-radio-state';

/**
 * The `NgpMenuItemIndicator` directive renders inside a checkbox or radio menu item
 * and exposes `data-checked` based on the parent item's checked state.
 */
@Directive({
  selector: '[ngpMenuItemIndicator]',
  exportAs: 'ngpMenuItemIndicator',
})
export class NgpMenuItemIndicator {
  constructor() {
    const element = injectElementRef();
    const checkboxState = injectMenuItemCheckboxState({ optional: true });
    const radioState = injectMenuItemRadioState({ optional: true });

    const checked = computed(() => checkboxState()?.checked() ?? radioState()?.checked() ?? false);

    dataBinding(element, 'data-checked', checked);
  }
}
