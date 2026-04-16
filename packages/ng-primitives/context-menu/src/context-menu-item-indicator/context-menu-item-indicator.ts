import { computed, Directive } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { injectMenuItemCheckboxState, injectMenuItemRadioState } from 'ng-primitives/menu';
import { dataBinding } from 'ng-primitives/state';

/**
 * The `NgpContextMenuItemIndicator` directive renders inside a checkbox or radio context menu item
 * and exposes `data-checked` based on the parent item's checked state.
 */
@Directive({
  selector: '[ngpContextMenuItemIndicator]',
  exportAs: 'ngpContextMenuItemIndicator',
})
export class NgpContextMenuItemIndicator {
  constructor() {
    const element = injectElementRef();
    const checkboxState = injectMenuItemCheckboxState({ optional: true });
    const radioState = injectMenuItemRadioState({ optional: true });

    const checked = computed(() => checkboxState()?.checked() ?? radioState()?.checked() ?? false);

    dataBinding(element, 'data-checked', checked);
  }
}
