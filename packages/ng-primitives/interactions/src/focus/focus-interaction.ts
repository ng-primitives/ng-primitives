import { FocusMonitor } from '@angular/cdk/a11y';
import { ElementRef, Renderer2, Signal, inject, signal } from '@angular/core';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { isFocusEnabled } from '../config/interactions-config';

export interface NgpFocusProps {
  disabled?: Signal<boolean>;
  focusWithin?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface NgpFocusState {
  isFocused: Signal<boolean>;
}

/**
 * @internal
 */
export function ngpFocus({
  onFocus,
  onBlur,
  focusWithin = false,
  disabled = signal(false),
}: NgpFocusProps): NgpFocusState {
  const canFocus = isFocusEnabled();

  if (!canFocus) {
    return { isFocused: signal(false) };
  }
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
        if (onFocus) {
          onFocus();
        }
        renderer.setAttribute(elementRef.nativeElement, 'data-focus', '');
      } else {
        if (onBlur) {
          onBlur();
        }
        renderer.removeAttribute(elementRef.nativeElement, 'data-focus');
      }
    });

  return { isFocused };
}
