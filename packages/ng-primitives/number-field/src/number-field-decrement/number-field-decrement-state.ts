import { computed, inject, Injector } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, createPrimitive, dataBinding, listener } from 'ng-primitives/state';
import { injectDisposables } from 'ng-primitives/utils';
import { injectNumberFieldState } from '../number-field/number-field-state';

/**
 * Public state surface for the NumberField Decrement primitive.
 */
export interface NgpNumberFieldDecrementState {}

/**
 * Inputs for configuring the NumberField Decrement primitive.
 */
export interface NgpNumberFieldDecrementProps {}

export const [
  NgpNumberFieldDecrementStateToken,
  ngpNumberFieldDecrement,
  injectNumberFieldDecrementState,
  provideNumberFieldDecrementState,
] = createPrimitive(
  'NgpNumberFieldDecrement',
  ({}: NgpNumberFieldDecrementProps): NgpNumberFieldDecrementState => {
    const elementRef = injectElementRef<HTMLButtonElement>();
    const numberField = injectNumberFieldState();
    const injector = inject(Injector);
    const disposables = injectDisposables();

    const isDisabled = computed(() => !numberField().canDecrement());

    // Host bindings
    attrBinding(elementRef, 'type', 'button');
    attrBinding(elementRef, 'tabindex', '-1');
    attrBinding(elementRef, 'aria-label', 'Decrement');
    attrBinding(elementRef, 'disabled', () => (isDisabled() ? '' : null));
    dataBinding(elementRef, 'data-disabled', isDisabled);

    ngpInteractions({
      hover: true,
      focusVisible: true,
      press: true,
      disabled: isDisabled,
    });

    let cleanupRepeat: (() => void) | null = null;

    function stopRepeat(): void {
      cleanupRepeat?.();
      cleanupRepeat = null;
    }

    listener(elementRef, 'pointerdown', (event: PointerEvent) => {
      event.preventDefault();

      if (isDisabled()) return;

      numberField().decrement();

      // Start auto-repeat: 400ms initial delay, then 60ms interval
      stopRepeat();

      let intervalCleanup: (() => void) | null = null;

      const delayCleanup = disposables.setTimeout(() => {
        intervalCleanup = disposables.setInterval(() => {
          if (!numberField().canDecrement()) {
            stopRepeat();
            return;
          }
          numberField().decrement();
        }, 60);
      }, 400);

      // Set up document-level listeners to stop on pointer release
      const pointerUpCleanup = listener(document, 'pointerup', stopRepeat, {
        config: false,
        injector,
      });

      const pointerCancelCleanup = listener(document, 'pointercancel', stopRepeat, {
        config: false,
        injector,
      });

      cleanupRepeat = () => {
        delayCleanup();
        intervalCleanup?.();
        pointerUpCleanup();
        pointerCancelCleanup();
      };
    });

    return {} satisfies NgpNumberFieldDecrementState;
  },
);
