/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, HostListener, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { NgpAccordionItem } from '../accordion-item/accordion-item';
import { injectAccordionItemState } from '../accordion-item/accordion-item-state';
import { NgpAccordion } from '../accordion/accordion';
import { injectAccordionState } from '../accordion/accordion-state';
import { NgpAccordionTriggerToken } from './accordion-trigger-token';

@Directive({
  selector: '[ngpAccordionTrigger]',
  exportAs: 'ngpAccordionTrigger',
  providers: [{ provide: NgpAccordionTriggerToken, useExisting: NgpAccordionTrigger }],
  host: {
    '[id]': 'id()',
    '[attr.data-orientation]': 'accordion().orientation()',
    '[attr.data-open]': 'item().open() ? "" : null',
    '[attr.data-disabled]': 'item().disabled() || accordion().disabled() ? "" : null',
    '[attr.aria-controls]': 'item().contentId()',
    '[attr.aria-expanded]': 'item().open()',
  },
})
export class NgpAccordionTrigger<T> {
  /**
   * Access the parent accordion.
   */
  protected readonly accordion = injectAccordionState<NgpAccordion<T>>();

  /**
   * The item instance.
   */
  protected readonly item = injectAccordionItemState<NgpAccordionItem<T>>();

  /**
   * The id of the trigger.
   */
  readonly id = input<string>(uniqueId('ngp-accordion-trigger'));

  /**
   * Toggle the accordion item.
   */
  @HostListener('click')
  toggle(): void {
    if (this.item().disabled() || this.accordion().disabled()) {
      return;
    }

    this.accordion().toggle(this.item().value()!);
  }
}
