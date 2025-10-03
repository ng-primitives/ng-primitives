import {
  afterRenderEffect,
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Signal,
  Type,
} from '@angular/core';
import { fromMutationObserver, injectDimensions, injectElementRef } from 'ng-primitives/internal';
import { attrBinding, dataBinding, listener } from 'ng-primitives/state';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { debounceTime } from 'rxjs/operators';
import { injectAccordionItemPattern } from '../accordion-item/accordion-item-pattern';
import { injectAccordionPattern } from '../accordion/accordion-pattern';

export interface NgpAccordionContentState {
  id: Signal<string>;
  hidden: Signal<string | null>;
}

export interface NgpAccordionContentProps {
  id: Signal<string>;
  element?: ElementRef<HTMLElement>;
}

export function ngpAccordionContentPattern<T>({
  id,
  element = injectElementRef(),
}: NgpAccordionContentProps): NgpAccordionContentState {
  const accordion = injectAccordionPattern<T>();
  const accordionItem = injectAccordionItemPattern<T>();
  const dimensions = injectDimensions();

  /**
   * The hidden until-found state of the content
   */
  const hidden = computed(() =>
    !accordionItem.open() && dimensions().height === 0 ? 'until-found' : null,
  );

  /**
   * Handle the beforematch event to automatically open the accordion item
   * when the browser's find-in-page functionality tries to reveal hidden content.
   */
  function onBeforeMatch(): void {
    const isDisabled = accordion.disabled() || accordionItem.disabled();
    if (isDisabled) return;
    accordion.toggle(accordionItem.value() as T);
  }

  // Setup host attribute bindings
  attrBinding(element, 'role', () => 'region');
  attrBinding(element, 'id', () => id());
  dataBinding(element, 'data-orientation', () => accordion.orientation());
  dataBinding(element, 'data-open', () => accordionItem.open());
  dataBinding(element, 'data-closed', () => !accordionItem.open());
  attrBinding(element, 'aria-labelledby', () => accordionItem.triggerId() || null);
  attrBinding(element, 'hidden', () => hidden());

  // Setup event listener
  listener(element, 'beforematch', () => onBeforeMatch());

  function updateDimensions(): void {
    if (accordionItem.open()) {
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
    disabled: computed(() => !accordionItem.open()),
  })
    .pipe(debounceTime(0), safeTakeUntilDestroyed())
    .subscribe(() => updateDimensions());

  const state: NgpAccordionContentState = { id, hidden };

  accordionItem.setContent(state);

  return state;
}

export const NgpAccordionContentPatternToken = new InjectionToken<NgpAccordionContentState>(
  'NgpAccordionContentPatternToken',
);

export function injectAccordionContentPattern(): NgpAccordionContentState {
  return inject(NgpAccordionContentPatternToken);
}

export function provideAccordionContentPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpAccordionContentState,
): FactoryProvider {
  return { provide: NgpAccordionContentPatternToken, useFactory: () => fn(inject(type)) };
}
