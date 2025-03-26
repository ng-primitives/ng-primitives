/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, OnInit, booleanAttribute, computed, contentChild, input } from '@angular/core';
import { NgpAccordionContentToken } from '../accordion-content/accordion-content-token';
import { NgpAccordionTriggerToken } from '../accordion-trigger/accordion-trigger-token';
import type { NgpAccordion } from '../accordion/accordion';
import { injectAccordionState } from '../accordion/accordion-state';
import { accordionItemState, provideAccordionItemState } from './accordion-item-state';
import { NgpAccordionItemToken } from './accordion-item-token';

@Directive({
  selector: '[ngpAccordionItem]',
  exportAs: 'ngpAccordionItem',
  providers: [
    { provide: NgpAccordionItemToken, useExisting: NgpAccordionItem },
    provideAccordionItemState(),
  ],
  host: {
    '[attr.data-orientation]': 'accordion().orientation()',
    '[attr.data-open]': 'state.open() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() || accordion().disabled() ? "" : null',
  },
})
export class NgpAccordionItem<T> implements OnInit {
  /**
   * Access the accordion.
   */
  protected readonly accordion = injectAccordionState<NgpAccordion<T>>();

  /**
   * The value of the accordion item.
   */
  readonly value = input<T>(undefined, {
    alias: 'ngpAccordionItemValue',
  });

  /**
   * Whether the accordion item is disabled.
   */
  readonly disabled = input<boolean, BooleanInput>(false, {
    alias: 'ngpAccordionItemDisabled',
    transform: booleanAttribute,
  });

  /**
   * Access the accordion trigger
   */
  private readonly trigger = contentChild(NgpAccordionTriggerToken);

  /**
   * Access the accordion content
   */
  private readonly content = contentChild(NgpAccordionContentToken);

  /**
   * Whether the accordion item is expanded.
   */
  readonly open = computed<boolean>(() => this.accordion().isOpen(this.value()!));

  /**
   * The trigger id.
   */
  readonly triggerId = computed(() => this.trigger()?.id());

  /**
   * The content id.
   */
  readonly contentId = computed(() => this.content()?.id());

  /**
   * The accordion item state.
   */
  private readonly state = accordionItemState<NgpAccordionItem<T>>(this);

  ngOnInit(): void {
    if (!this.value()) {
      throw new Error('The accordion item value is required');
    }
  }
}
