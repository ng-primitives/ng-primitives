import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { effect, ElementRef, inject, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { onBooleanChange } from 'ng-primitives/utils';

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
    .pipe(takeUntilDestroyed())
    .subscribe(origin =>
      // null indicates the element was blurred
      origin === null ? onBlur() : onFocus(origin),
    );

  // if the component becomes disabled and it is focused, hide the focus
  onBooleanChange(disabled, () => focus(false));

  // anytime the focus state changes we want to update the attribute
  effect(() => elementRef.nativeElement.setAttribute('data-focus-visible', isFocused().toString()));

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
    if (origin === 'keyboard' || origin === 'program') {
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
