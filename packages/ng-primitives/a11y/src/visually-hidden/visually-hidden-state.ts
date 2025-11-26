import { ChangeDetectorRef, inject, Signal, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, createPrimitive, styleBinding } from 'ng-primitives/state';

/**
 * The state interface for the VisuallyHidden pattern.
 */
export interface NgpVisuallyHiddenState {
  /**
   * Whether the element is hidden.
   */
  readonly hidden: Signal<boolean>;

  /**
   * Set the element visibility.
   * @param visible
   */
  setVisibility(visible: boolean): void;
}

/**
 * The props interface for the VisuallyHidden pattern.
 */
export interface NgpVisuallyHiddenProps {
  /**
   * Whether the element is hidden. Default is true.
   */
  readonly hidden?: Signal<boolean>;
}

export const [
  NgpVisuallyHiddenStateToken,
  ngpVisuallyHidden,
  injectVisuallyHiddenState,
  provideVisuallyHiddenState,
] = createPrimitive(
  'NgpVisuallyHidden',
  ({ hidden: _hidden = signal(true) }: NgpVisuallyHiddenProps): NgpVisuallyHiddenState => {
    const element = injectElementRef();
    const hidden = controlled(_hidden);
    const changeDetector = inject(ChangeDetectorRef);

    // Apply styles to visually hide the element
    styleBinding(element, 'position', () => (hidden() ? 'absolute' : null));
    styleBinding(element, 'width', () => (hidden() ? '1px' : null));
    styleBinding(element, 'height', () => (hidden() ? '1px' : null));
    styleBinding(element, 'margin', () => (hidden() ? '-1px' : null));
    styleBinding(element, 'padding', () => (hidden() ? '0' : null));
    styleBinding(element, 'overflow', () => (hidden() ? 'hidden' : null));
    styleBinding(element, 'clip', () => (hidden() ? 'rect(0, 0, 0, 0)' : null));
    styleBinding(element, 'white-space', () => (hidden() ? 'nowrap' : null));
    styleBinding(element, 'border', () => (hidden() ? '0' : null));
    styleBinding(element, 'word-wrap', () => (hidden() ? 'normal' : null));
    styleBinding(element, 'outline', () => (hidden() ? '0' : null));
    styleBinding(element, '-webkit-appearance', () => (hidden() ? 'none' : null));
    styleBinding(element, '-moz-appearance', () => (hidden() ? 'none' : null));
    styleBinding(element, 'inset-inline-start', () => (hidden() ? '0' : null));

    function setVisibility(visible: boolean): void {
      hidden.set(!visible);
      // If a change-detection cycle might be running, schedule detection asynchronously and exit
      // to avoid re-entrancy. Otherwise fall through to call detectChanges synchronously.
      Promise.resolve().then(() => changeDetector.detectChanges());
    }

    return {
      hidden: hidden.asReadonly(),
      setVisibility,
    };
  },
);
