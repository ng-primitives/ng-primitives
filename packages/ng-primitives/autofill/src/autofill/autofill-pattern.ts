import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { injectElementRef, injectStyleInjector } from 'ng-primitives/internal';
import { attrBinding, listener } from 'ng-primitives/state';

/**
 * The state interface for the Autofill pattern.
 */
export interface NgpAutofillState {
  /**
   * Whether the element is autofilled.
   */
  autofilled: Signal<boolean>;
}

/**
 * The props interface for the Autofill pattern.
 */
export interface NgpAutofillProps {
  /**
   * The element reference for the autofill.
   */
  element?: ElementRef<HTMLElement>;

  /**
   * Callback when autofill state changes.
   */
  onAutofillChange?: (autofilled: boolean) => void;
}

/**
 * The Autofill pattern function.
 */
export function ngpAutofillPattern({
  element = injectElementRef(),
  onAutofillChange,
}: NgpAutofillProps = {}): NgpAutofillState {
  const styleInjector = injectStyleInjector();
  const autofilled = signal(false);

  // Inject the autofill detection styles
  styleInjector.add(
    'ngp-autofill',
    `
      @keyframes ngp-autofill-start { }
      @keyframes ngp-autofill-end {}

      [data-autofill]:-webkit-autofill {
        animation: ngp-autofill-start 0s 1ms;
      }

      [data-autofill]:not(:-webkit-autofill) {
        animation: ngp-autofill-end 0s 1ms;
      }
    `,
  );

  attrBinding(element, 'data-autofill', () => (autofilled() ? '' : null));

  function onAnimationStart(event: AnimationEvent): void {
    if (event.animationName === 'ngp-autofill-start') {
      autofilled.set(true);
      onAutofillChange?.(true);
    }

    if (event.animationName === 'ngp-autofill-end') {
      autofilled.set(false);
      onAutofillChange?.(false);
    }
  }

  listener(element, 'animationstart', onAnimationStart);

  return {
    autofilled: autofilled.asReadonly(),
  };
}

/**
 * The injection token for the Autofill pattern.
 */
export const NgpAutofillPatternToken = new InjectionToken<NgpAutofillState>(
  'NgpAutofillPatternToken',
);

/**
 * Injects the Autofill pattern.
 */
export function injectAutofillPattern(): NgpAutofillState {
  return inject(NgpAutofillPatternToken);
}

/**
 * Provides the Autofill pattern.
 */
export function provideAutofillPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpAutofillState,
): FactoryProvider {
  return { provide: NgpAutofillPatternToken, useFactory: () => fn(inject(type)) };
}
