export interface ClassifiedMutations {
  readonly hasPrepended: boolean;
  readonly hasAppended: boolean;
  readonly firstPrepended?: HTMLElement;
  readonly firstExisting?: HTMLElement;
}

/**
 * Extract added HTML elements from DOM mutation records.
 */
export function extractAddedElements(mutations: readonly MutationRecord[]): HTMLElement[] {
  return mutations.flatMap(mutation =>
    Array.from(mutation.addedNodes).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    ),
  );
}

// Document position bitmasks (Node.DOCUMENT_POSITION_PRECEDING = 2, Node.DOCUMENT_POSITION_FOLLOWING = 4)
const DOCUMENT_POSITION_PRECEDING = 2;
const DOCUMENT_POSITION_FOLLOWING = 4;

/**
 * Classify added elements as prepended or appended relative to existing children.
 */
export function classifyAddedElements(
  container: HTMLElement,
  addedElements: readonly HTMLElement[],
): ClassifiedMutations {
  const addedSet = new Set(addedElements);
  const firstExisting = Array.from(container.children).find(
    (child): child is HTMLElement => child instanceof HTMLElement && !addedSet.has(child),
  );

  if (firstExisting === undefined) {
    return { hasPrepended: false, hasAppended: true };
  }

  const hasPrepended = addedElements.some(
    el => (el.compareDocumentPosition(firstExisting) & DOCUMENT_POSITION_FOLLOWING) !== 0,
  );
  const hasAppended = addedElements.some(
    el => (el.compareDocumentPosition(firstExisting) & DOCUMENT_POSITION_PRECEDING) !== 0,
  );

  const firstPrepended = hasPrepended
    ? Array.from(container.children).find(
        (child): child is HTMLElement => child instanceof HTMLElement && addedSet.has(child),
      )
    : undefined;

  return {
    hasPrepended,
    hasAppended,
    firstPrepended,
    firstExisting,
  };
}

/**
 * Adjust the viewport scroll position when content is prepended above existing messages.
 */
export function compensatePrependedScroll(
  viewport: HTMLElement,
  firstPrepended: HTMLElement,
  firstExisting: HTMLElement,
  lastScrollTop: number,
): void {
  const prependedHeight =
    firstExisting.getBoundingClientRect().top - firstPrepended.getBoundingClientRect().top;

  if (prependedHeight <= 0) {
    return;
  }

  const nativeShift = Math.max(0, viewport.scrollTop - lastScrollTop);
  const adjustment = prependedHeight - nativeShift;

  if (adjustment > 0) {
    viewport.scrollTop += adjustment;
  }
}
