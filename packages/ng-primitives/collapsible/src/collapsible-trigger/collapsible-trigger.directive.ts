import { Directive, HostListener } from '@angular/core';
import { injectCollapsible } from '../collapsible/collapsible.token';
import { NgpCollapsibleTriggerToken } from './collapsible-trigger.token';

@Directive({
  standalone: true,
  selector: 'button[ngpCollapsibleTrigger]',
  exportAs: 'ngpCollapsibleTrigger',
  providers: [{ provide: NgpCollapsibleTriggerToken, useExisting: NgpCollapsibleTriggerDirective }],
  host: {
    type: 'button',
    '[attr.aria-controls]': 'collapsible.contentId()',
    '[attr.aria-expanded]': 'collapsible.open()',
    '[attr.data-state]': 'collapsible.open() ? "open" : "closed"',
    '[attr.data-disabled]': 'collapsible.disabled() ? "" : null',
    '[disabled]': 'collapsible.disabled()',
  },
})
export class NgpCollapsibleTriggerDirective {
  /**
   * Access the collapsible instance
   */
  protected readonly collapsible = injectCollapsible();

  @HostListener('click')
  onClick(): void {
    this.collapsible.toggle();
  }
}
