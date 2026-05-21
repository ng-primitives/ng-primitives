import { afterRenderEffect, computed, signal, Signal } from '@angular/core';
import {
  explicitEffect,
  fromMutationObserver,
  injectDimensions,
  injectElementRef,
} from 'ng-primitives/internal';
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

    // data-enter is set when the item opens (user interaction), data-exit when it closes.
    // Neither is set on initial render, preventing animation on page load.
    const enter = signal(false);
    const exit = signal(false);
    dataBinding(element, 'data-enter', enter);
    dataBinding(element, 'data-exit', exit);

    listener(element, 'beforematch', onBeforeMatch);
    const clearAnimation = (event: AnimationEvent) => {
      if (event.target === element.nativeElement) {
        enter.set(false);
        exit.set(false);
      }
    };
    listener(element, 'animationend', clearAnimation);
    listener(element, 'animationcancel', clearAnimation);

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
        const scrollHeight = element.nativeElement.scrollHeight;

        // Element is inside a hidden container (e.g. inactive tab with display:none).
        // All three dimensions are 0 only when the element has no layout at all.
        // Checking dimensions() (from ResizeObserver) prevents misidentifying
        // legitimately empty content (e.g. all children removed) as a hidden container.
        const { width, height } = dimensions();
        if (scrollHeight === 0 && width === 0 && height === 0) {
          return;
        }

        const scrollWidth = element.nativeElement.scrollWidth;

        // remove the inline styles to reset them
        element.nativeElement.style.removeProperty('--ngp-accordion-content-width');
        element.nativeElement.style.removeProperty('--ngp-accordion-content-height');
        // set the dimensions based on the content
        element.nativeElement.style.setProperty(
          '--ngp-accordion-content-width',
          `${scrollWidth}px`,
        );
        element.nativeElement.style.setProperty(
          '--ngp-accordion-content-height',
          `${scrollHeight}px`,
        );
      }
    }

    // Track dimensions() so this effect re-runs when the element becomes visible.
    // Handles the case where the accordion is initialized inside a hidden container.
    afterRenderEffect(() => {
      dimensions(); // reactive dep — re-runs when element resizes (e.g. container becomes visible)
      updateDimensions();
    });

    // Drive enter/exit attributes based on open state changes.
    // Skips the initial run so no animation plays on page load.
    let initialized = false;
    explicitEffect([accordionItem().open], ([isOpen]) => {
      if (!initialized) {
        initialized = true;
        return;
      }
      if (isOpen) {
        exit.set(false);
        enter.set(true);
      } else {
        enter.set(false);
        exit.set(true);
      }
    });

    // update dimensions when the content changes
    fromMutationObserver(element.nativeElement, {
      childList: true,
      subtree: true,
      disabled: computed(() => !accordionItem().open()),
    })
      .pipe(debounceTime(0), safeTakeUntilDestroyed())
      .subscribe(() => updateDimensions());

    return { id } satisfies NgpAccordionContentState;
  },
);
