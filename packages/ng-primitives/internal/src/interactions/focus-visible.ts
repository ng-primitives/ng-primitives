import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { ElementRef, inject, Renderer2, Signal, signal } from '@angular/core';
import { onBooleanChange } from 'ng-primitives/utils';
import { safeTakeUntilDestroyed } from '../observables/take-until-destroyed';

export interface NgpFocusVisibleOptions {
  disabled?: Signal<boolean>;
  focusChange?: (value: boolean) => void;
}

export interface NgpFocusVisibleState {
  isFocused: Signal<boolean>;
}

export function setupFocusVisible({
  focusChange,
  disabled = signal(false),
}: NgpFocusVisibleOptions): NgpFocusVisibleState {
  /**
   * Access the element that the directive is applied to.
   */
  const elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /**
   * Access the renderer.
   */
  const renderer = inject(Renderer2);

  /**
   * Access the focus monitor.
   */
  const focusMonitor = inject(FocusMonitor);

  /**
   * Whether the element is currently focused.
   */
  const isFocused = signal<boolean>(false);

  // handle focus state
  focusMonitor
    .monitor(elementRef.nativeElement)
    .pipe(safeTakeUntilDestroyed())
    .subscribe(origin =>
      // null indicates the element was blurred
      origin === null ? onBlur() : onFocus(origin),
    );

  // if the component becomes disabled and it is focused, hide the focus
  onBooleanChange(disabled, () => focus(false));

  function onFocus(origin: FocusOrigin): void {
    if (disabled() || isFocused()) {
      return;
    }

    // for some elements the focus visible state should always appear on focus
    if (alwaysShowFocus()) {
      focus(true);
      return;
    }

    // if the focus origin is keyboard or program(focused programmatically), then the focus is visible
    if (origin === 'keyboard') {
      focus(true);
      return;
    }
  }

  function onBlur(): void {
    if (disabled() || !isFocused()) {
      return;
    }

    focus(false);
  }

  /**
   * Trigger the focus signal along with the focusChange event.
   */
  function focus(value: boolean) {
    if (isFocused() === value) {
      return;
    }

    isFocused.set(value);
    focusChange?.(value);

    if (value) {
      renderer.setAttribute(elementRef.nativeElement, 'data-focus-visible', '');
    } else {
      renderer.removeAttribute(elementRef.nativeElement, 'data-focus-visible');
    }
  }

  function alwaysShowFocus(): boolean {
    const nonTextInputTypes = [
      'checkbox',
      'radio',
      'range',
      'color',
      'file',
      'image',
      'button',
      'submit',
      'reset',
    ];

    // if this is an input element and it is a text input
    if (
      elementRef.nativeElement instanceof HTMLInputElement &&
      !nonTextInputTypes.includes(elementRef.nativeElement.type)
    ) {
      return true;
    }

    // if this is a textarea
    if (elementRef.nativeElement instanceof HTMLTextAreaElement) {
      return true;
    }

    // if this is an element with contenteditable
    if (
      elementRef.nativeElement.isContentEditable ||
      elementRef.nativeElement.hasAttribute('contenteditable')
    ) {
      return true;
    }

    return false;
  }

  return {
    isFocused,
  };
}
