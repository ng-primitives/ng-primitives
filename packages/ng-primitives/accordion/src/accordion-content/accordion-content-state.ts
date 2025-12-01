import { afterRenderEffect, computed, signal, Signal } from '@angular/core';
import { fromMutationObserver, injectDimensions, injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { safeTakeUntilDestroyed, uniqueId } from 'ng-primitives/utils';
import { debounceTime } from 'rxjs/operators';
import { injectAccordionItemState } from '../accordion-item/accordion-item-state';
import { injectAccordionState } from '../accordion/accordion-state';

export interface NgpAccordionContentState {
  /**
   * The id of the content region
   */
  readonly id: Signal<string>;
}

export interface NgpAccordionContentProps {
  /**
   * The id of the content region
   */
  readonly id?: Signal<string>;
}

export const [
  NgpAccordionContentStateToken,
  ngpAccordionContent,
  injectAccordionContentState,
  provideAccordionContentState,
] = createPrimitive(
  'NgpAccordionContent',
  <T>({ id = signal(uniqueId('ngp-accordion-content')) }: NgpAccordionContentProps) => {
    const element = injectElementRef();
    const accordion = injectAccordionState<T>();
    const accordionItem = injectAccordionItemState<T>();
    const dimensions = injectDimensions();

    const hidden = computed(() =>
      !accordionItem().open() && dimensions().height === 0 ? 'until-found' : null,
    );

    // Host bindings
    attrBinding(element, 'role', 'region');
    attrBinding(element, 'id', id);
    attrBinding(element, 'aria-labelledby', accordionItem().triggerId);
    attrBinding(element, 'hidden', hidden);

    dataBinding(element, 'data-orientation', accordion().orientation);
    dataBinding(element, 'data-open', accordionItem().open);
    dataBinding(element, 'data-closed', () => !accordionItem().open());

    listener(element, 'beforematch', onBeforeMatch);

    // Register the content with the accordion item state
    accordionItem().setContent(id());

    /**
     * Handle the beforematch event to automatically open the accordion item
     * when the browser's find-in-page functionality tries to reveal hidden content.
     */
    function onBeforeMatch(): void {
      const isDisabled = accordion().disabled() || accordionItem().disabled();
      if (isDisabled) {
        return;
      }
      accordion().toggle(accordionItem().value() as T);
    }

    function updateDimensions(): void {
      if (accordionItem().open()) {
        // remove the inline styles to reset them
        element.nativeElement.style.removeProperty('--ngp-accordion-content-width');
        element.nativeElement.style.removeProperty('--ngp-accordion-content-height');
        // set the dimensions based on the content
        element.nativeElement.style.setProperty(
          '--ngp-accordion-content-width',
          `${element.nativeElement.scrollWidth}px`,
        );
        element.nativeElement.style.setProperty(
          '--ngp-accordion-content-height',
          `${element.nativeElement.scrollHeight}px`,
        );
      }
    }

    // any time the open state of the accordion item changes, update the dimensions
    afterRenderEffect(() => updateDimensions());

    // update dimensions when the content changes
    fromMutationObserver(element.nativeElement, {
      childList: true,
      subtree: true,
      disabled: computed(() => !accordionItem().open()),
    })
      .pipe(debounceTime(0), safeTakeUntilDestroyed())
      .subscribe(() => updateDimensions());

    return {};
  },
);
