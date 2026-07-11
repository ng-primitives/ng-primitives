import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpCollapsibleTrigger, provideCollapsibleTriggerState } from './collapsible-trigger-state';

/**
 * Apply the `ngpCollapsibleTrigger` directive to an element - typically a
 * `button` - that toggles the collapsible open and closed.
 */
@Directive({
  selector: '[ngpCollapsibleTrigger]',
  exportAs: 'ngpCollapsibleTrigger',
  providers: [provideCollapsibleTriggerState()],
})
export class NgpCollapsibleTrigger {
  /**
   * The id of the trigger.
   */
  readonly id = input<string>(uniqueId('ngp-collapsible-trigger'));

  private readonly state = ngpCollapsibleTrigger({ id: this.id });

  /**
   * Toggle the collapsible.
   */
  toggle(): void {
    this.state.toggle();
  }
}
