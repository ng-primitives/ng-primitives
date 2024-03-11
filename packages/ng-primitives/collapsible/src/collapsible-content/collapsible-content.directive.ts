import { Directive, input } from '@angular/core';
import { uniqueId } from '../../../utils/src';
import { injectCollapsible } from '../collapsible/collapsible.token';
import { NgpCollapsibleContentToken } from './collapsible-content.token';

@Directive({
  standalone: true,
  selector: '[ngpCollapsibleContent]',
  exportAs: 'ngpCollapsibleContent',
  providers: [{ provide: NgpCollapsibleContentToken, useExisting: NgpCollapsibleContentDirective }],
  host: {
    '[attr.data-state]': 'collapsible.open() ? "open" : "closed"',
    '[attr.data-disabled]': 'collapsible.disabled() ? "" : null',
    '[hidden]': '!collapsible.open()',
  },
})
export class NgpCollapsibleContentDirective {
  /**
   * Access the collapsible parent
   */
  protected readonly collapsible = injectCollapsible();

  /**
   * The id of the collapsible content
   */
  readonly id = input<string>(uniqueId('ngp-collapsible-content'));
}
