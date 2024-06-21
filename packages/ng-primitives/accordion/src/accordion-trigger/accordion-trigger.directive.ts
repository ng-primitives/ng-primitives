/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, HostListener, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectAccordionItem } from '../accordion-item/accordion-item.token';
import { injectAccordion } from '../accordion/accordion.token';
import { NgpAccordionTriggerToken } from './accordion-trigger.token';

@Directive({
  standalone: true,
  selector: '[ngpAccordionTrigger]',
  exportAs: 'ngpAccordionTrigger',
  providers: [{ provide: NgpAccordionTriggerToken, useExisting: NgpAccordionTrigger }],
  host: {
    '[id]': 'id()',
    '[attr.data-orientation]': 'accordion.orientation()',
    '[attr.data-state]': 'item.open() ? "open" : "closed"',
    '[attr.data-disabled]': 'item.disabled() || accordion.disabled()',
    '[attr.aria-controls]': 'item.contentId()',
    '[attr.aria-expanded]': 'item.open()',
  },
})
export class NgpAccordionTrigger {
  /**
   * Access the parent accordion.
   */
  protected readonly accordion = injectAccordion();

  /**
   * The item instance.
   */
  protected readonly item = injectAccordionItem();

  /**
   * The id of the trigger.
   */
  readonly id = input<string>(uniqueId('ngp-accordion-trigger'));

  /**
   * Toggle the accordion item.
   */
  @HostListener('click')
  toggle(): void {
    this.accordion.toggle(this.item.value());
  }
}
