import { afterRenderEffect, computed, Directive, input } from '@angular/core';
import { fromMutationObserver, injectElementRef } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed, uniqueId } from 'ng-primitives/utils';
import { debounceTime } from 'rxjs';
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

  constructor() {
    this.accordionItem().content.set(this);

    // any time the open state of the accordion item changes, update the dimensions
    afterRenderEffect(() => this.updateDimensions());

    // update dimensions when the content changes
    fromMutationObserver(this.elementRef.nativeElement, {
      childList: true,
      subtree: true,
      disabled: computed(() => !this.accordionItem().open()),
    })
      .pipe(debounceTime(0), safeTakeUntilDestroyed())
      .subscribe(() => this.updateDimensions());
  }

  private updateDimensions(): void {
    if (this.accordionItem().open()) {
      // remove the inline styles to reset them
      this.elementRef.nativeElement.style.removeProperty('--ngp-accordion-content-width');
      this.elementRef.nativeElement.style.removeProperty('--ngp-accordion-content-height');
      // set the dimensions based on the content
      this.elementRef.nativeElement.style.setProperty(
        '--ngp-accordion-content-width',
        `${this.elementRef.nativeElement.scrollWidth}px`,
      );
      this.elementRef.nativeElement.style.setProperty(
        '--ngp-accordion-content-height',
        `${this.elementRef.nativeElement.scrollHeight}px`,
      );
    }
  }
}
