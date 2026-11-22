// SVG and MathML roots are isolated too, and only `HTMLElement` carries the `inert` property, so
// isolation goes through the attribute.
type IsolatableElement = Element & ElementCSSInlineStyle;

interface IsolatedElementRecord {
  ariaHidden: string | null;
  count: number;
  inertAttribute: string | null;
  pointerEvents: string;
}

const LIVE_CONTENT_SELECTOR = '.cdk-focus-trap-anchor, [aria-live], [data-cdk-live-announcer]';
const OVERLAY_CONTAINER_SELECTOR = '.cdk-overlay-container';

const isolatedElements = new WeakMap<IsolatableElement, IsolatedElementRecord>();

export function isolateDrawerModal(
  document: Document,
  popup: HTMLElement,
  backdrop: HTMLElement | null,
): () => void {
  const allowedElements = new Set([popup]);
  if (backdrop) {
    allowedElements.add(backdrop);
  }
  // Each entry keeps the record it joined: once a portal host releases that record, this
  // disposer must not restore the one a later modal created for the same element.
  const isolated = new Map<IsolatableElement, IsolatedElementRecord>();
  let current: Node | null = popup;

  while (current && current !== document.body) {
    const parent: Node | null = current.parentNode;
    if (!parent) {
      break;
    }
    for (const sibling of Array.from(parent.childNodes)) {
      if (sibling !== current && isIsolatable(sibling)) {
        isolateOutsideTree(sibling, allowedElements, isolated);
      }
    }
    current = isShadowRoot(parent) ? parent.host : parent;
  }

  return () => {
    for (const [element, record] of isolated) {
      restoreElement(element, record);
    }
    isolated.clear();
  };
}

/**
 * Lift every modal isolation from `element` now, so a later restore cannot write back the state it
 * recorded. A portal host calls this when it shows or hides, since that state is then stale.
 */
export function releaseDrawerIsolation(element: HTMLElement): void {
  const record = isolatedElements.get(element);
  if (record) {
    record.count = 1;
    restoreElement(element, record);
  }
}

function isolateElement(element: IsolatableElement): IsolatedElementRecord {
  const existing = isolatedElements.get(element);
  if (existing) {
    existing.count += 1;
    return existing;
  }

  const record: IsolatedElementRecord = {
    ariaHidden: element.getAttribute('aria-hidden'),
    count: 1,
    inertAttribute: element.getAttribute('inert'),
    pointerEvents: element.style.pointerEvents,
  };
  isolatedElements.set(element, record);
  element.setAttribute('aria-hidden', 'true');
  element.setAttribute('inert', '');
  element.style.pointerEvents = 'none';
  return record;
}

function restoreElement(element: IsolatableElement, record: IsolatedElementRecord): void {
  if (isolatedElements.get(element) !== record) {
    return;
  }
  record.count -= 1;
  if (record.count > 0) {
    return;
  }

  if (record.ariaHidden === null) {
    element.removeAttribute('aria-hidden');
  } else {
    element.setAttribute('aria-hidden', record.ariaHidden);
  }
  if (record.inertAttribute === null) {
    element.removeAttribute('inert');
  } else {
    element.setAttribute('inert', record.inertAttribute);
  }
  element.style.pointerEvents = record.pointerEvents;
  isolatedElements.delete(element);
}

function isolateOutsideTree(
  element: IsolatableElement,
  allowedElements: Set<HTMLElement>,
  isolated: Map<IsolatableElement, IsolatedElementRecord>,
): void {
  if (isProtectedElement(element, allowedElements)) {
    return;
  }
  // The shared CDK root itself stays live, so an overlay opened from inside the drawer lands in an
  // interactive container. The panes already in it sit behind the modal like any other content.
  if (
    element.matches(OVERLAY_CONTAINER_SELECTOR) ||
    containsProtectedElement(element, allowedElements)
  ) {
    for (const child of Array.from(element.children)) {
      if (isIsolatable(child)) {
        isolateOutsideTree(child, allowedElements, isolated);
      }
    }
    return;
  }
  // One disposer can reach an element once only, so it never holds two counts on a record.
  if (!isolated.has(element)) {
    isolated.set(element, isolateElement(element));
  }
}

function isProtectedElement(
  element: IsolatableElement,
  allowedElements: Set<HTMLElement>,
): boolean {
  return (
    (allowedElements as Set<Element>).has(element) ||
    ['LINK', 'SCRIPT', 'STYLE'].includes(element.tagName.toUpperCase()) ||
    element.matches(LIVE_CONTENT_SELECTOR) ||
    matchesOpenPopover(element)
  );
}

function containsProtectedElement(
  element: IsolatableElement,
  allowedElements: Set<HTMLElement>,
): boolean {
  return (
    [...allowedElements].some(allowed => element.contains(allowed)) ||
    element.querySelector(`${LIVE_CONTENT_SELECTOR}, ${OVERLAY_CONTAINER_SELECTOR}`) !== null ||
    containsOpenPopover(element)
  );
}

function matchesOpenPopover(element: IsolatableElement): boolean {
  try {
    return !element.classList.contains('cdk-overlay-popover') && element.matches(':popover-open');
  } catch {
    return false;
  }
}

function containsOpenPopover(element: IsolatableElement): boolean {
  try {
    return element.querySelector(':popover-open') !== null;
  } catch {
    return false;
  }
}

function isIsolatable(node: Node): node is IsolatableElement {
  return node.nodeType === Node.ELEMENT_NODE && 'style' in node;
}

function isShadowRoot(node: Node): node is ShadowRoot {
  return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && 'host' in node;
}
