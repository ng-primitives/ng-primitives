import {
  FactoryProvider,
  inject,
  InjectionToken,
  InputSignal,
  InputSignalWithTransform,
  isSignal,
  linkedSignal,
  ProviderToken,
  WritableSignal,
} from '@angular/core';

/**
 * This converts the state object to a writable state object.
 * This means that inputs become signals which are writable.
 */
export type State<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends InputSignalWithTransform<infer U, any>
    ? WritableSignal<U>
    : T[K] extends InputSignal<infer R>
      ? WritableSignal<R>
      : T[K];
};

/**
 * Create a new injection token for the state.
 * @param description The description of the token
 */
export function createStateToken<T>(description: string): InjectionToken<T> {
  return new InjectionToken<State<T>>(`Ngp${description}StateToken`);
}

/**
 * Create a new provider for the state. It first tries to inject the state from the parent injector,
 * as this allows for the state to be hoisted to a higher level in the component tree. This can
 * be useful to avoid issues where the injector can't be shared in some cases when ng-content is used.
 * @param token The token for the state
 */
export function createStateProvider<T>(token: ProviderToken<T>): () => FactoryProvider {
  return () => ({
    provide: token,
    useFactory: () => inject(token, { optional: true, skipSelf: true }) ?? {},
  });
}

/**
 * Create a new state injector for the state.
 * @param token The token for the state
 */
export function createStateInjector<T>(token: ProviderToken<State<T>>): <U = T>() => State<U> {
  return <U = T>() => inject(token) as unknown as State<U>;
}

/**
 * Convert the original state object into a writable state object.
 * @param token The token for the state
 */
export function createState(token: ProviderToken<State<unknown>>) {
  return <U>(state: U): State<U> => {
    const internalState = inject(token);

    // Iterating over properties
    for (const key in state) {
      const value = state[key as keyof U];

      // @ts-ignore
      internalState[key] = isSignal(value) ? linkedSignal(() => value()) : value;
    }

    // Iterating over prototype methods
    const prototype = Object.getPrototypeOf(state);

    for (const key of Object.getOwnPropertyNames(prototype)) {
      (internalState as Record<string, unknown>)[key] = prototype[key as keyof U].bind(state);
    }

    return internalState as unknown as State<U>;
  };
}
