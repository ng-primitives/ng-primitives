import { Signal, signal } from '@angular/core';
import { injectElementRef, injectStyleInjector } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, listener } from 'ng-primitives/state';

export interface NgpAutofillState {
  /**
   * Whether the element is autofilled.
   */
  readonly autofilled: Signal<boolean>;
}

export interface NgpAutofillProps {
  /**
   * Callback fired when the autofill state changes.
   */
  onAutofillChange?: (value: boolean) => void;
}

export const [NgpAutofillStateToken, ngpAutofill, injectAutofillState, provideAutofillState] =
  createPrimitive('NgpAutofill', ({ onAutofillChange }: NgpAutofillProps) => {
    const element = injectElementRef();
    const styleInjector = injectStyleInjector();
    const autofilled = signal(false);

    // Host bindings
    dataBinding(element, 'data-autofill', autofilled);

    // Inject the autofill detection styles
    // This technique is based on that used by the Angular CDK
    // https://github.com/angular/components/blob/main/src/cdk/text-field/_index.scss
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

    // Listen for animation start events
    listener(element, 'animationstart', (event: AnimationEvent) => {
      if (event.animationName === 'ngp-autofill-start') {
        setAutofilled(true);
        onAutofillChange?.(true);
      }

      if (event.animationName === 'ngp-autofill-end') {
        setAutofilled(false);
        onAutofillChange?.(false);
      }
    });

    function setAutofilled(value: boolean): void {
      autofilled.set(value);
    }

    return {
      autofilled,
    } satisfies NgpAutofillState;
  });
