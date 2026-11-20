import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input } from '@angular/core';
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
  /**
   * Whether the group coordinates hover between its sibling triggers. Turn it off
   * when the siblings no longer sit between a trigger and its menu - a collapsed
   * icon rail, say, where the pointer reaches the panel without crossing anything,
   * so the coordination only costs the siblings their responsiveness. Takes effect
   * from the next transit; one already in flight finishes as it started.
   */
  readonly siblingTracking = input<boolean, BooleanInput>(true, {
    alias: 'ngpMenuTriggerGroupSiblingTracking',
    transform: booleanAttribute,
  });

  protected readonly state = ngpMenuTriggerGroup({ siblingTracking: this.siblingTracking });
}
