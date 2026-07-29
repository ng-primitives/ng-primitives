interface IsolatedElementRecord {
  ariaHidden: string | null;
  count: number;
  inert: boolean;
  inertAttribute: string | null;
  pointerEvents: string;
}

const isolatedElements = new WeakMap<HTMLElement, IsolatedElementRecord>();

export function isolateDrawerModal(
  document: Document,
  popup: HTMLElement,
  backdrop: HTMLElement | null,
): () => void {
  const allowedElements = new Set([popup]);
  if (backdrop) {
    allowedElements.add(backdrop);
  }
  const isolated: HTMLElement[] = [];
  let current: Node | null = popup;

  while (current && current !== document.body) {
    const parent: Node | null = current.parentNode;
    if (!parent) {
      break;
    }
    for (const sibling of Array.from(parent.childNodes)) {
      if (sibling !== current && isHtmlElement(sibling)) {
        isolateOutsideTree(sibling, allowedElements, isolated);
      }
    }
    current = isShadowRoot(parent) ? parent.host : parent;
  }

  return () => {
    for (const element of isolated) {
      restoreElement(element);
    }
  };
}

function isolateElement(element: HTMLElement): void {
  const existing = isolatedElements.get(element);
  if (existing) {
    existing.count += 1;
    return;
  }

  isolatedElements.set(element, {
    ariaHidden: element.getAttribute('aria-hidden'),
    count: 1,
    inert: element.inert,
    inertAttribute: element.getAttribute('inert'),
    pointerEvents: element.style.pointerEvents,
  });
  element.setAttribute('aria-hidden', 'true');
  element.inert = true;
  element.style.pointerEvents = 'none';
}

function restoreElement(element: HTMLElement): void {
  const record = isolatedElements.get(element);
  if (!record) {
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
  element.inert = record.inert;
  if (record.inertAttribute === null) {
    element.removeAttribute('inert');
  } else {
    element.setAttribute('inert', record.inertAttribute);
  }
  element.style.pointerEvents = record.pointerEvents;
  isolatedElements.delete(element);
}

function isolateOutsideTree(
  element: HTMLElement,
  allowedElements: Set<HTMLElement>,
  isolated: HTMLElement[],
): void {
  if (isProtectedElement(element, allowedElements)) {
    return;
  }
  if (containsProtectedElement(element, allowedElements)) {
    for (const child of Array.from(element.children)) {
      if (isHtmlElement(child)) {
        isolateOutsideTree(child, allowedElements, isolated);
      }
    }
    return;
  }
  isolateElement(element);
  isolated.push(element);
}

function isProtectedElement(element: HTMLElement, allowedElements: Set<HTMLElement>): boolean {
  return (
    allowedElements.has(element) ||
    ['LINK', 'SCRIPT', 'STYLE'].includes(element.tagName) ||
    element.matches(
      '.cdk-focus-trap-anchor, .cdk-overlay-container, [aria-live], [data-cdk-live-announcer]',
    ) ||
    matchesOpenPopover(element)
  );
}

function containsProtectedElement(
  element: HTMLElement,
  allowedElements: Set<HTMLElement>,
): boolean {
  return (
    [...allowedElements].some(allowed => element.contains(allowed)) ||
    element.querySelector(
      '.cdk-focus-trap-anchor, .cdk-overlay-container, [aria-live], [data-cdk-live-announcer]',
    ) !== null ||
    containsOpenPopover(element)
  );
}

function matchesOpenPopover(element: HTMLElement): boolean {
  try {
    return !element.classList.contains('cdk-overlay-popover') && element.matches(':popover-open');
  } catch {
    return false;
  }
}

function containsOpenPopover(element: HTMLElement): boolean {
  try {
    return element.querySelector(':popover-open') !== null;
  } catch {
    return false;
  }
}

function isHtmlElement(node: Node): node is HTMLElement {
  return node.nodeType === Node.ELEMENT_NODE && 'inert' in node;
}

function isShadowRoot(node: Node): node is ShadowRoot {
  return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE && 'host' in node;
}
