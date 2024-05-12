import { FocusOrigin } from '@angular/cdk/a11y';
import { coerceElement } from '@angular/cdk/coercion';
import { ElementRef, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FocusManager {
  /**
   * Focus an element with an optional origin.
   */
  focus(element: ElementRef<HTMLElement>, origin?: FocusOrigin): void;
  focus(element: HTMLElement, origin?: FocusOrigin): void;
  focus(element: ElementRef<HTMLElement> | HTMLElement, origin: FocusOrigin = 'program'): void {
    element = coerceElement(element);

    switch (origin) {
      case 'keyboard':
        // trigger the focus-visible state for keyboard users
        element.contentEditable = 'true';
        element.focus({ preventScroll: true });
        element.contentEditable = 'false';
        break;
      default:
        element.focus();
        break;
    }
  }
}
