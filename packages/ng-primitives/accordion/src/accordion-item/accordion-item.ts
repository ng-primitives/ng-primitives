import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, booleanAttribute, computed, input, signal } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { NgpAccordionContent } from '../accordion-content/accordion-content';
import { NgpAccordionTrigger } from '../accordion-trigger/accordion-trigger';
import { NgpAccordion } from '../accordion/accordion';
import { injectAccordionState } from '../accordion/accordion-state';
import { accordionItemState, provideAccordionItemState } from './accordion-item-state';

/**
 * Apply the `ngpAccordionItem` directive to an element that represents an accordion item.
 */
@Directive({
  selector: '[ngpAccordionItem]',
  exportAs: 'ngpAccordionItem',
  providers: [provideAccordionItemState()],
  host: {
    '[attr.data-orientation]': 'accordion().orientation()',
    '[attr.data-open]': 'open() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() || accordion().disabled() ? "" : null',
  },
})
export class NgpAccordionItem<T> {
  /**
   * Access the accordion.
   */
  protected readonly accordion = injectAccordionState<NgpAccordion<T>>();

  /**
   * The value of the accordion item.
   */
  readonly value = input<T>(uniqueId('ngp-accordion-item') as T, {
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
   * @internal
   */
  readonly trigger = signal<NgpAccordionTrigger<T> | undefined>(undefined);

  /**
   * Access the accordion content
   * @internal
   */
  readonly content = signal<NgpAccordionContent<T> | undefined>(undefined);

  /**
   * Whether the accordion item is expanded.
   */
  readonly open = computed<boolean>(() => this.accordion().isOpen(this.state.value()!));

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
  protected readonly state = accordionItemState<NgpAccordionItem<T>>(this);
}
