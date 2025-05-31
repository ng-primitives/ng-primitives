import { afterRenderEffect, Injector, signal, Signal } from '@angular/core';

interface DomSortOptions<T> {
  getElement: (item: T) => HTMLElement | null;
  injector?: Injector;
}

/**
 * A utility function to sort an array of items based on their position in the DOM.
 * It returns a new array with the items sorted in the order they appear in the DOM.
 * @param items
 * @param options
 * @internal
 */
export function domSort<T>(items: Signal<T[]>, options: DomSortOptions<T>): Signal<T[]> {
  const output = signal<T[]>(items().slice());

  // we evaluate the items in the DOM after the render cycle to ensure their positions are correct
  afterRenderEffect(
    {
      write: () => {
        const sortedItems = items()
          .slice()
          .sort((a, b) => {
            const elementA = options.getElement(a);
            const elementB = options.getElement(b);

            if (!elementA || !elementB) {
              return 0; // If either element is not found, maintain original order
            }

            return elementA.compareDocumentPosition(elementB) & Node.DOCUMENT_POSITION_FOLLOWING
              ? -1
              : 1;
          });

        output.set(sortedItems);
      },
    },
    { injector: options.injector },
  );

  return output.asReadonly();
}
