/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, input } from '@angular/core';
import { injectDimensions, uniqueId } from 'ng-primitives/utils';
import { injectAccordionItem } from '../accordion-item/accordion-item.token';
import { injectAccordion } from '../accordion/accordion.token';
import { NgpAccordionContentToken } from './accordion-content.token';

@Directive({
  standalone: true,
  selector: '[ngpAccordionContent]',
  exportAs: 'ngpAccordionContent',
  providers: [{ provide: NgpAccordionContentToken, useExisting: NgpAccordionContent }],
  host: {
    role: 'region',
    '[id]': 'id()',
    '[attr.data-orientation]': 'accordion.orientation()',
    '[attr.data-open]': 'dimensions().mounted ? accordionItem.open() : null',
    '[attr.aria-labelledby]': 'accordionItem.triggerId()',
    '[style.--ngp-accordion-content-width.px]': 'dimensions().width',
    '[style.--ngp-accordion-content-height.px]': 'dimensions().height',
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

  /**
   * The size of the content region
   */
  protected readonly dimensions = injectDimensions();
}
