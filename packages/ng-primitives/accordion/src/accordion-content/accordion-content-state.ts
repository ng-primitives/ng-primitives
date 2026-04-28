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

    // Set after first paint via rAF so CSS can gate transitions on this attribute.
    // Prevents flash when a hidden container (e.g. inactive tab) becomes visible and
    // the CSS var jumps from unset to its real value.
    const animated = signal(false);
    dataBinding(element, 'data-animated', animated);

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

    // True once --ngp-accordion-content-height has been successfully written to the element.
    // Used to delay data-animated so opening an accordion inside a previously hidden container
    // (e.g. an inactive tab) does not trigger a transition when the container becomes visible.
    let cssVarEverSet = false;

    function updateDimensions(): void {
      if (accordionItem().open()) {
        const scrollHeight = element.nativeElement.scrollHeight;

        // Element is inside a hidden container (e.g. inactive tab with display:none).
        // Skip to avoid setting 0 — afterRenderEffect tracks dimensions() and will
        // re-run via ResizeObserver when the container becomes visible.
        if (scrollHeight === 0) {
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
        cssVarEverSet = true;
      }
    }

    // Track dimensions() so this effect re-runs when the element becomes visible.
    // Handles the case where the accordion is initialized inside a hidden container.
    let animationScheduled = false;
    afterRenderEffect(() => {
      dimensions(); // reactive dep — re-runs when element resizes (e.g. container becomes visible)
      updateDimensions();

      // Enable transitions only after the CSS var has been painted at least once (open item),
      // or immediately for closed items (no CSS var needed before first open).
      // This prevents a transition firing when a hidden container (e.g. inactive tab) becomes
      // visible and the CSS var jumps from unset to its real value.
      if (!animationScheduled && (cssVarEverSet || !accordionItem().open())) {
        animationScheduled = true;
        // rAF ensures data-animated is added after the first paint so the element is already
        // at its correct height before transitions are enabled.
        requestAnimationFrame(() => animated.set(true));
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
