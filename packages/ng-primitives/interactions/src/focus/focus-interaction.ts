import { FocusMonitor } from '@angular/cdk/a11y';
import {
  ElementRef,
  Renderer2,
  Signal,
  afterRenderEffect,
  inject,
  isSignal,
  signal,
  untracked,
} from '@angular/core';
import { isFocusEnabled } from '../config/interactions-config';

export interface NgpFocusProps {
  disabled?: Signal<boolean>;
  focusWithin?: boolean | Signal<boolean>;
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

  /**
   * Whether to count the element as focused when its children are focused.
   */
  const isWithin = isSignal(focusWithin) ? focusWithin : signal(focusWithin);

  afterRenderEffect(onCleanup => {
    const isDisabled = disabled();
    const within = isWithin();
    untracked(() => {
      const subscription = focusMonitor.monitor(elementRef, within).subscribe(focusOrigin => {
        if (isDisabled) {
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

      onCleanup(() => {
        subscription.unsubscribe();
        focusMonitor.stopMonitoring(elementRef);
      });
    });
  });

  return { isFocused };
}
