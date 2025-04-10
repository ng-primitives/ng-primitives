import { BooleanInput } from '@angular/cdk/coercion';
import { Directive, OnInit, booleanAttribute, computed, input, signal } from '@angular/core';
import { NgpAccordionContent } from '../accordion-content/accordion-content';
import { NgpAccordionTrigger } from '../accordion-trigger/accordion-trigger';
import { NgpAccordion } from '../accordion/accordion';
import { injectAccordionState } from '../accordion/accordion-state';
import { accordionItemState, provideAccordionItemState } from './accordion-item-state';

@Directive({
  selector: '[ngpAccordionItem]',
  exportAs: 'ngpAccordionItem',
  providers: [provideAccordionItemState()],
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
  readonly triggerId = computed(() => this.state.trigger()?.id());

  /**
   * The content id.
   */
  readonly contentId = computed(() => this.state.content()?.id());

  /**
   * The accordion item state.
   */
  private readonly state = accordionItemState<NgpAccordionItem<T>>(this);

  ngOnInit(): void {
    if (!this.state.value()) {
      throw new Error('The accordion item value is required');
    }
  }
}
