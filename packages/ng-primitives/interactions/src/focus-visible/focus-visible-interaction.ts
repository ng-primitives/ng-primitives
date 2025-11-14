import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { ElementRef, inject, Renderer2, Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { onBooleanChange, safeTakeUntilDestroyed } from 'ng-primitives/utils';
import { isFocusVisibleEnabled } from '../config/interactions-config';

export interface NgpFocusVisibleProps {
  disabled?: Signal<boolean>;
  focusChange?: (value: boolean) => void;
  element?: ElementRef<HTMLElement>;
}

export interface NgpFocusVisibleState {
  isFocused: Signal<boolean>;
}

/**
 * @internal
 */
export function ngpFocusVisibleInteraction({
  focusChange,
  disabled = signal(false),
  element = injectElementRef(),
}: NgpFocusVisibleProps): NgpFocusVisibleState {
  const canFocusVisible = isFocusVisibleEnabled();

  if (!canFocusVisible) {
    return { isFocused: signal(false) };
  }

  const renderer = inject(Renderer2);
  const focusMonitor = inject(FocusMonitor);

  // Whether the element is currently focused.
  const isFocused = signal<boolean>(false);

  // handle focus state
  focusMonitor
    .monitor(element.nativeElement)
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
      renderer.setAttribute(element.nativeElement, 'data-focus-visible', '');
    } else {
      renderer.removeAttribute(element.nativeElement, 'data-focus-visible');
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
      element.nativeElement instanceof HTMLInputElement &&
      !nonTextInputTypes.includes(element.nativeElement.type)
    ) {
      return true;
    }

    // if this is a textarea
    if (element.nativeElement instanceof HTMLTextAreaElement) {
      return true;
    }

    // if this is an element with contenteditable
    if (
      element.nativeElement.isContentEditable ||
      element.nativeElement.hasAttribute('contenteditable')
    ) {
      return true;
    }

    return false;
  }

  return {
    isFocused,
  };
}
