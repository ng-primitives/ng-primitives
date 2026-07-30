import { Directive } from '@angular/core';
import { ngpMenuTriggerGroup, provideMenuTriggerGroupState } from './menu-trigger-group-state';

/**
 * The `NgpMenuTriggerGroup` directive wraps a set of sibling `NgpMenuTrigger` elements,
 * such as the items of a vertical navigation menu, so that moving the pointer from an
 * open menu's trigger toward the menu itself does not accidentally open a sibling
 * trigger it passes over on the way.
 */
@Directive({
  selector: '[ngpMenuTriggerGroup]',
  exportAs: 'ngpMenuTriggerGroup',
  providers: [provideMenuTriggerGroupState()],
})
export class NgpMenuTriggerGroup {
  protected readonly state = ngpMenuTriggerGroup({});
}
