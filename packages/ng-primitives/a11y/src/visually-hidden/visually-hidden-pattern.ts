import {
  ChangeDetectorRef,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Signal,
  signal,
  Type,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, styleBinding } from 'ng-primitives/state';

export interface NgpVisuallyHiddenState {
  /**
   * Whether the element is hidden.
   */
  hidden: Signal<boolean>;
  /**
   * Sets the visibility of the element.
   * @param visible Whether the element should be visible.
   */
  setVisibility(visible: boolean): void;
}

export interface NgpVisuallyHiddenProps {
  element?: ElementRef<HTMLElement>;
  hidden?: Signal<boolean>;
}

export function ngpVisuallyHiddenPattern({
  element = injectElementRef(),
  hidden: _hidden = signal(true),
}: NgpVisuallyHiddenProps = {}): NgpVisuallyHiddenState {
  const hidden = controlled(_hidden);
  const changeDetector = inject(ChangeDetectorRef);

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
    changeDetector.markForCheck();
  }

  return {
    hidden: hidden.asReadonly(),
    setVisibility,
  };
}

export const NgpVisuallyHiddenPatternToken = new InjectionToken<NgpVisuallyHiddenState>(
  'NgpVisuallyHiddenPatternToken',
);

export function injectVisuallyHiddenPattern(): NgpVisuallyHiddenState {
  return inject(NgpVisuallyHiddenPatternToken);
}

export function provideVisuallyHiddenPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpVisuallyHiddenState,
): FactoryProvider {
  return { provide: NgpVisuallyHiddenPatternToken, useFactory: () => fn(inject(type)) };
}
