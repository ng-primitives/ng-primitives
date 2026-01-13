/**
 * This implementation is a copy of the signalMethod function from `@ngrx/signals`
 * @see https://github.com/ngrx/platform/blob/main/modules/signals/src/signal-method.ts
 */
import {
  assertInInjectionContext,
  DestroyRef,
  effect,
  EffectRef,
  inject,
  Injector,
  untracked,
} from '@angular/core';

/**
 * This type is a copy of the SignalMethod type from `@ngrx/signals`
 * @see https://github.com/ngrx/platform/blob/main/modules/signals/src/signal-method.ts
 */
export type SignalMethod<Input> = ((
  input: Input | (() => Input),
  config?: { injector?: Injector },
) => EffectRef) &
  EffectRef;

/**
 * This function is a copy of the signalMethod function from `@ngrx/signals`
 * @see https://github.com/ngrx/platform/blob/main/modules/signals/src/signal-method.ts
 */
export function signalMethod<Input>(
  processingFn: (value: Input) => void,
  config?: { injector?: Injector },
): SignalMethod<Input> {
  if (typeof ngDevMode !== 'undefined' && ngDevMode && !config?.injector) {
    assertInInjectionContext(signalMethod);
  }

  const watchers: EffectRef[] = [];
  const sourceInjector = config?.injector ?? inject(Injector);

  const signalMethodFn = (
    input: Input | (() => Input),
    config?: { injector?: Injector },
  ): EffectRef => {
    if (isReactiveComputation(input)) {
      const callerInjector = getCallerInjector();
      if (
        typeof ngDevMode !== 'undefined' &&
        ngDevMode &&
        config?.injector === undefined &&
        callerInjector === undefined
      ) {
        console.warn(
          'ng-primitives: The function returned by signalMethod was called',
          'outside the injection context with a signal. This may lead to',
          'a memory leak. Make sure to call it within the injection context',
          '(e.g. in a constructor or field initializer) or pass an injector',
          'explicitly via the config parameter.\n\nFor more information, see:',
          'https://ngrx.io/guide/signals/signal-method#automatic-cleanup',
        );
      }

      const instanceInjector = config?.injector ?? callerInjector ?? sourceInjector;

      const watcher = effect(
        () => {
          const value = input();
          untracked(() => processingFn(value));
        },
        { injector: instanceInjector },
      );
      watchers.push(watcher);

      instanceInjector.get(DestroyRef).onDestroy(() => {
        const ix = watchers.indexOf(watcher);
        if (ix !== -1) {
          watchers.splice(ix, 1);
        }
      });

      return watcher;
    } else {
      processingFn(input);
      return { destroy: () => void true };
    }
  };

  signalMethodFn.destroy = () => watchers.forEach(watcher => watcher.destroy());

  return signalMethodFn;
}

function getCallerInjector(): Injector | undefined {
  try {
    return inject(Injector);
  } catch {
    return undefined;
  }
}

function isReactiveComputation<T>(value: T | (() => T)): value is () => T {
  return typeof value === 'function';
}
