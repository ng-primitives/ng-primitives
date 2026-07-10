import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpCollapsibleContent, provideCollapsibleContentState } from './collapsible-content-state';

/**
 * Apply the `ngpCollapsibleContent` directive to the element that contains the
 * collapsible content that is shown and hidden by the trigger.
 */
@Directive({
  selector: '[ngpCollapsibleContent]',
  exportAs: 'ngpCollapsibleContent',
  providers: [provideCollapsibleContentState()],
})
export class NgpCollapsibleContent {
  /**
   * The id of the content region.
   */
  readonly id = input<string>(uniqueId('ngp-collapsible-content'));

  constructor() {
    ngpCollapsibleContent({ id: this.id });
  }
}
