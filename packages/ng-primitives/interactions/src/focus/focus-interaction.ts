import { FocusMonitor } from '@angular/cdk/a11y';
import { ElementRef, Renderer2, Signal, inject, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { isFocusEnabled } from '../config/interactions-config';

export interface NgpFocusProps {
  disabled?: Signal<boolean>;
  focusWithin?: boolean;
  focus?: () => void;
  blur?: () => void;
  element?: ElementRef<HTMLElement>;
}

export interface NgpFocusState {
  isFocused: Signal<boolean>;
}

/**
 * @internal
 */
export function ngpFocusInteraction({
  focus,
  blur,
  focusWithin = false,
  disabled = signal(false),
  element = injectElementRef(),
}: NgpFocusProps): NgpFocusState {
  const canFocus = isFocusEnabled();

  if (!canFocus) {
    return { isFocused: signal(false) };
  }

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
    .monitor(element, focusWithin)
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
        renderer.setAttribute(element.nativeElement, 'data-focus', '');
      } else {
        if (blur) {
          blur();
        }
        renderer.removeAttribute(element.nativeElement, 'data-focus');
      }
    });

  return { isFocused };
}
