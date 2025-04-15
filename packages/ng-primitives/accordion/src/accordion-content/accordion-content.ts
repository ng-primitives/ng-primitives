import { afterRenderEffect, Directive, input, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { uniqueId } from 'ng-primitives/utils';
import { injectAccordionItemState } from '../accordion-item/accordion-item-state';
import type { NgpAccordion } from '../accordion/accordion';
import { injectAccordionState } from '../accordion/accordion-state';

/**
 * Apply the `ngpAccordionContent` directive to an element that represents the content of an accordion item.
 */
@Directive({
  selector: '[ngpAccordionContent]',
  exportAs: 'ngpAccordionContent',
  host: {
    role: 'region',
    '[id]': 'id()',
    '[attr.data-orientation]': 'accordion().orientation()',
    '[attr.data-open]': 'accordionItem().open() ? "" : null',
    '[attr.data-closed]': 'accordionItem().open() ? null : ""',
    '[attr.aria-labelledby]': 'accordionItem().triggerId()',
    '[style.--ngp-accordion-content-width.px]': 'width()',
    '[style.--ngp-accordion-content-height.px]': 'height()',
  },
})
export class NgpAccordionContent<T> {
  /**
   * Access the accordion content element reference
   */
  private readonly elementRef = injectElementRef();

  /**
   * Access the accordion
   */
  protected readonly accordion = injectAccordionState<NgpAccordion<T>>();

  /**
   * Access the accordion item
   */
  protected readonly accordionItem = injectAccordionItemState();

  /**
   * The id of the content region
   */
  readonly id = input<string>(uniqueId('ngp-accordion-content'));

  /**
   * The content width
   */
  readonly width = signal<number>(0);

  /**
   * The content height
   */
  readonly height = signal<number>(0);

  constructor() {
    this.accordionItem().content.set(this);

    afterRenderEffect(() => {
      if (this.accordionItem().open()) {
        this.width.set(this.elementRef.nativeElement.scrollWidth);
        this.height.set(this.elementRef.nativeElement.scrollHeight);
      }
    });
  }
}
