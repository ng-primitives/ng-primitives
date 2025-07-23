import { Injector, Signal, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { explicitEffect } from '../signals/explicit-effect';

interface NgpMutationObserverOptions {
  /**
   * Whether to listen for events.
   */
  disabled?: Signal<boolean>;
  /**
   * The injector to use when called from outside of the injector context.
   */
  injector?: Injector;
  /**
   * Whether the childList should be observed.
   */
  childList?: boolean;
  /**
   * Whether the subtree should be observed.
   */
  subtree?: boolean;
  /**
   * Whether the attributes should be observed.
   */
  attributes?: boolean;
  /**
   * Whether the characterData should be observed.
   */
  characterData?: boolean;
  /**
   * Whether the attributeFilter should be observed.
   */
  attributeFilter?: string[];
}

/**
 * This function sets up a mutation observer to listen for changes in the DOM.
 * It will stop listening when the `disabled` signal is true, and re-enable when it is false.
 * @param options - Options for the mutation observer
 */
export function fromMutationObserver(
  element: HTMLElement,
  {
    childList,
    subtree,
    attributes,
    characterData,
    disabled = signal(false),
    injector,
  }: NgpMutationObserverOptions = {},
): Observable<MutationRecord[]> {
  return new Observable<MutationRecord[]>(observable => {
    let observer: MutationObserver | null = null;

    function setupOrTeardownObserver() {
      if (disabled()) {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        return;
      }

      observer = new MutationObserver(mutations => observable.next(mutations));
      observer.observe(element, { childList, subtree, attributes, characterData });
    }

    setupOrTeardownObserver();

    // any time the disabled state changes, we need to re-evaluate the observer
    explicitEffect([disabled], () => setupOrTeardownObserver(), { injector });

    return () => observer?.disconnect();
  });
}
