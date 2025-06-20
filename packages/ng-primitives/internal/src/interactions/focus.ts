import { FocusMonitor } from '@angular/cdk/a11y';
import { ElementRef, Renderer2, Signal, inject, signal } from '@angular/core';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';

export interface NgpFocusOptions {
  disabled?: Signal<boolean>;
  focusWithin?: boolean;
  focus?: () => void;
  blur?: () => void;
}

export interface NgpFocusState {
  isFocused: Signal<boolean>;
}

export function setupFocus({
  focus,
  blur,
  focusWithin = false,
  disabled = signal(false),
}: NgpFocusOptions): NgpFocusState {
  /**
   * Access the element reference.
   */
  const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the focus monitor.
   */
  const focusMonitor = inject(FocusMonitor);

  /**
   * Access the renderer.
   */
  const renderer = inject(Renderer2);

  /**
   * Whether the element is currently focused.
   */
  const isFocused = signal<boolean>(false);

  focusMonitor
    .monitor(elementRef, focusWithin)
    .pipe(safeTakeUntilDestroyed())
    .subscribe(focusOrigin => {
      if (disabled()) {
        return;
      }

      isFocused.set(focusOrigin !== null);
      if (focusOrigin !== null) {
        if (focus) {
          focus();
        }
        renderer.setAttribute(elementRef.nativeElement, 'data-focus', '');
      } else {
        if (blur) {
          blur();
        }
        renderer.removeAttribute(elementRef.nativeElement, 'data-focus');
      }
    });

  return { isFocused };
}
