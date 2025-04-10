import {
  computed,
  FactoryProvider,
  inject,
  InjectionToken,
  InputSignal,
  InputSignalWithTransform,
  isSignal,
  linkedSignal,
  ProviderToken,
  signal,
  Signal,
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
 * This is similar to the state object, but we don't expose properties that are not
 * inputs.
 */
export type CreatedState<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends InputSignalWithTransform<infer U, any>
    ? WritableSignal<U>
    : T[K] extends InputSignal<infer R>
      ? WritableSignal<R>
      : never;
};

export type InjectedState<T> = Signal<State<T>>;

/**
 * Create a new injection token for the state.
 * @param description The description of the token
 */
export function createStateToken<T>(description: string): InjectionToken<T> {
  return new InjectionToken<Signal<State<T>>>(`Ngp${description}StateToken`);
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
    useFactory: () => inject(token, { optional: true, skipSelf: true }) ?? signal({}),
  });
}

type CreateStateInjectorOptions = {
  /**
   * Whether the state may not be immediately available. This can happen when the child is instantiated before the parent.
   */
  deferred?: boolean;
};

/**
 * Create a new state injector for the state.
 * @param token The token for the state
 */
export function createStateInjector<T>(
  token: ProviderToken<State<T>>,
  options: { deferred: true },
): <U = T>() => Signal<State<U> | undefined>;
export function createStateInjector<T>(
  token: ProviderToken<State<T>>,
  options?: CreateStateInjectorOptions,
): <U = T>() => Signal<State<U>>;
export function createStateInjector<T>(
  token: ProviderToken<State<T>>,
  options: CreateStateInjectorOptions = {},
): <U = T>() => Signal<State<U> | undefined> {
  return <U = T>() => {
    const value = inject(token) as Signal<State<U> | undefined>;

    if (options.deferred) {
      return computed(() =>
        Object.keys(value() ?? {}).length === 0 ? undefined : value(),
      ) as Signal<State<U> | undefined>;
    }

    return value as Signal<State<U>>;
  };
}

/**
 * Convert the original state object into a writable state object.
 * @param token The token for the state
 */
export function createState(token: ProviderToken<WritableSignal<State<unknown>>>) {
  return <U>(state: U): CreatedState<U> => {
    const internalState = inject(token);

    internalState.update(obj => {
      // Iterating over properties
      for (const key in state) {
        const value = state[key as keyof U];

        // If this is a signal but doesn't have a set method, we need to wrap it in a linked signal
        // This is because the signal is not writable
        // and we need to create a new signal that is writable
        // and linked to the original signal
        if (isSignal(value) && 'set' in value === false) {
          // @ts-ignore
          obj[key] = linkedSignal(() => value());
        } else {
          // @ts-ignore
          obj[key] = value;
        }
      }

      // Iterating over prototype methods
      const prototype = Object.getPrototypeOf(state);

      for (const key of Object.getOwnPropertyNames(prototype)) {
        (obj as Record<string, unknown>)[key] = prototype[key as keyof U].bind(state);
      }

      return { ...obj };
    });

    return internalState() as unknown as CreatedState<U>;
  };
}
