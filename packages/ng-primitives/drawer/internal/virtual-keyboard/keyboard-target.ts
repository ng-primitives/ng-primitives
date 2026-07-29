// Adapted from Base UI DrawerVirtualKeyboardProvider (MIT), pinned at c33f4210.

const KEYBOARD_INPUT_TYPES = new Set([
  'email',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'url',
]);

export interface DrawerKeyboardTarget {
  readonly focusTarget: HTMLElement;
  readonly clickTarget: HTMLElement;
}

export function resolveKeyboardInputTarget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  if (isKeyboardInputElement(target)) {
    return target.isContentEditable ? getContentEditableHost(target) : target;
  }

  const label = target.closest('label') as HTMLLabelElement | null;
  const control = label?.control;
  return control && isKeyboardInputElement(control) ? control : null;
}

export function resolveKeyboardTouchTarget(
  target: EventTarget | null,
): DrawerKeyboardTarget | null {
  const focusTarget = resolveKeyboardInputTarget(target);
  if (!focusTarget) {
    return null;
  }

  return {
    focusTarget,
    clickTarget: target instanceof HTMLElement ? target : focusTarget,
  };
}

export function isInteractiveNonKeyboardTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement) || resolveKeyboardInputTarget(target)) {
    return false;
  }

  return Boolean(
    target.closest(
      'button, a[href], input, select, textarea, label, [contenteditable], [tabindex]:not([tabindex="-1"])',
    ),
  );
}

export function containsComposed(root: HTMLElement, target: HTMLElement): boolean {
  let current: Element | null = target;
  while (current) {
    if (current === root) {
      return true;
    }
    current = composedParent(current);
  }
  return false;
}

export function findKeyboardScrollTarget(
  target: HTMLElement,
  boundary: HTMLElement,
): HTMLElement | null {
  let current = composedParent(target);
  let intended: HTMLElement | null = null;

  while (current) {
    if (current instanceof HTMLElement) {
      const overflow = current.ownerDocument.defaultView?.getComputedStyle(current).overflowY;
      if (overflow && ['auto', 'scroll', 'overlay'].includes(overflow)) {
        if (current.scrollHeight > current.clientHeight) {
          return current;
        }
        intended ??= current;
      }
    }

    if (current === boundary) {
      break;
    }
    current = composedParent(current);
  }

  return intended;
}

function isKeyboardInputElement(element: HTMLElement): boolean {
  if (
    element.matches('[contenteditable]:not([contenteditable="false"])') ||
    element.isContentEditable
  ) {
    return true;
  }

  const window = element.ownerDocument.defaultView;
  if (!window) {
    return false;
  }
  if (element instanceof window.HTMLTextAreaElement) {
    return !element.disabled;
  }
  return (
    element instanceof window.HTMLInputElement &&
    !element.disabled &&
    KEYBOARD_INPUT_TYPES.has(element.type)
  );
}

function getContentEditableHost(element: HTMLElement): HTMLElement {
  let host = element;
  while (
    host.parentElement?.matches('[contenteditable]:not([contenteditable="false"])') ||
    host.parentElement?.isContentEditable
  ) {
    host = host.parentElement;
  }
  return host;
}

function composedParent(element: Element): Element | null {
  if (element.assignedSlot) {
    return element.assignedSlot;
  }
  if (element.parentElement) {
    return element.parentElement;
  }
  const root = element.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}
