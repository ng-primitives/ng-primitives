/**
 * This function sorts DOM elements based on their position in the document.
 * However items can also explitly define their index in which case it will be used
 * to sort the elements first. This allows for both natural DOM order sorting as well
 * as custom order for cases like virtual scrolling where items might be rendered
 * out of order.
 */
export function domSort<T>(
  items: T[],
  getElement: (item: T) => HTMLElement,
  getIndex?: (item: T) => number | undefined,
): T[] {
  return items.slice().sort((a, b) => {
    const indexA = getIndex?.(a);
    const indexB = getIndex?.(b);

    if (indexA !== undefined && indexB !== undefined) {
      return indexA - indexB;
    }

    if (indexA !== undefined) {
      return -1;
    }

    if (indexB !== undefined) {
      return 1;
    }

    const elementA = getElement(a);
    const elementB = getElement(b);

    return elementA.compareDocumentPosition(elementB) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
}
