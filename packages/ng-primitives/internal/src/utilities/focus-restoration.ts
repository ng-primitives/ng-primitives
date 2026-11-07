import { Injectable } from '@angular/core';

/**
 * Focus an overlay hands back to an element when it closes, as opposed to focus the user moved
 * there. The focus event fires synchronously inside `restore`, so listeners can ask about it.
 */
@Injectable({ providedIn: 'root' })
export class NgpFocusRestoration {
  private readonly restoring = new Set<Element>();

  /** Run `focus`, which moves focus to `element`, as a focus restoration. */
  restore(element: Element, focus: () => void): void {
    this.restoring.add(element);
    try {
      focus();
    } finally {
      this.restoring.delete(element);
    }
  }

  /** Whether `element` is receiving focus from an overlay that is closing. */
  isRestoring(element: Element): boolean {
    return this.restoring.has(element);
  }
}
