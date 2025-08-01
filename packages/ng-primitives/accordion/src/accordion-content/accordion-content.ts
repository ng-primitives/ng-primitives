import { isPlatformBrowser } from '@angular/common';
import { afterRenderEffect, computed, Directive, inject, input, PLATFORM_ID } from '@angular/core';
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
    '(beforematch)': 'onBeforeMatch()',
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
   * The platform id
   */
  private readonly platformId = inject(PLATFORM_ID);

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

    /**
     * Compatibility with older browsers that do not support the beforematch event
     * The hidden attribute must be removed.
     */
    afterRenderEffect({
      write: () => {
        if (!this.supportsBeforeMatch()) return;

        if (this.accordionItem().open()) {
          this.elementRef.nativeElement.removeAttribute('hidden');
        } else {
          this.elementRef.nativeElement.setAttribute('hidden', 'until-found');
        }
      },
    });
  }

  /**
   * Handle the beforematch event to automatically open the accordion item
   * when the browser's find-in-page functionality tries to reveal hidden content.
   */
  onBeforeMatch(): void {
    const isDisabled = this.accordion().disabled() || this.accordionItem().disabled();
    if (!this.supportsBeforeMatch() || isDisabled) {
      return;
    }
    this.accordion().toggle(this.accordionItem().value() as T);
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

  private supportsBeforeMatch() {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }
    // Check if the beforematch event is supported
    return typeof HTMLElement !== 'undefined' && 'onbeforematch' in HTMLElement.prototype;
  }
}
