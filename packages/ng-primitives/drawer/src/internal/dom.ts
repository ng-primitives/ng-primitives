import { NgpDrawerFocusTarget } from '../drawer.types';

let idCounter = 0;

export function createDrawerId(part: string): string {
  idCounter += 1;
  return `ngp-drawer-${part}-${idCounter}`;
}

export function isNativeInteractiveElement(element: HTMLElement): boolean {
  return (
    element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement ||
    (element instanceof HTMLAnchorElement && element.hasAttribute('href'))
  );
}

export function resolveFocusTarget(
  target: NgpDrawerFocusTarget,
  document: Document,
): HTMLElement | null {
  if (target === false || target === null || target === undefined) {
    return null;
  }
  if (typeof target === 'function') {
    return target() ?? null;
  }
  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target);
  }
  return target;
}

export function eventPathContains(event: Event, element: Element): boolean {
  const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
  return path.includes(element) || element.contains(event.target as Node | null);
}

export function isKeyboardInput(element: Element | null): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false;
  }
  if (element.matches('[disabled], [aria-disabled="true"]')) {
    return false;
  }
  if (element instanceof HTMLTextAreaElement) {
    return true;
  }
  if (element instanceof HTMLInputElement) {
    return ![
      'button',
      'checkbox',
      'color',
      'file',
      'hidden',
      'image',
      'radio',
      'range',
      'reset',
      'submit',
    ].includes(element.type);
  }
  return element.isContentEditable;
}
