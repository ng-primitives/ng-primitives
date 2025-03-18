/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectAccordionItem } from '../accordion-item/accordion-item.token';
import { injectAccordion } from '../accordion/accordion.token';
import { NgpAccordionContentToken } from './accordion-content.token';

@Directive({
  selector: '[ngpAccordionContent]',
  exportAs: 'ngpAccordionContent',
  providers: [{ provide: NgpAccordionContentToken, useExisting: NgpAccordionContent }],
  host: {
    role: 'region',
    '[id]': 'id()',
    '[attr.data-orientation]': 'accordion.orientation()',
    '[attr.data-open]': 'accordionItem.open() ? "" : null',
    '[attr.aria-labelledby]': 'accordionItem.triggerId()',
  },
})
export class NgpAccordionContent {
  /**
   * Access the accordion
   */
  protected readonly accordion = injectAccordion();

  /**
   * Access the accordion item
   */
  protected readonly accordionItem = injectAccordionItem();

  /**
   * The id of the content region
   */
  readonly id = input<string>(uniqueId('ngp-accordion-content'));
}
