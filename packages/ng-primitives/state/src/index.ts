import {
  computed,
  FactoryProvider,
  inject,
  InjectionToken,
  InjectOptions,
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

export interface CreateStateProviderOptions {
  /**
   * Whether we should check for the state in the parent injector.
   */
  inherit?: boolean;
}

/**
 * Create a new provider for the state. It first tries to inject the state from the parent injector,
 * as this allows for the state to be hoisted to a higher level in the component tree. This can
 * be useful to avoid issues where the injector can't be shared in some cases when ng-content is used.
 * @param token The token for the state
 */
export function createStateProvider<T>(
  token: ProviderToken<T>,
): (options?: CreateStateProviderOptions) => FactoryProvider {
  return ({ inherit }: CreateStateProviderOptions = {}) => ({
    provide: token,
    useFactory: () => {
      if (inherit === false) {
        // if we are not checking the parent, we want to create a new state
        return signal({});
      }
      // if we are checking the parent, we want to check if the state is already defined
      return inject(token, { optional: true, skipSelf: true }) ?? signal({});
    },
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
): <U = T>(injectOptions?: InjectOptions) => Signal<State<U> | undefined>;
export function createStateInjector<T>(
  token: ProviderToken<State<T>>,
  options?: CreateStateInjectorOptions,
): <U = T>(injectOptions?: InjectOptions) => Signal<State<U>>;
export function createStateInjector<T>(
  token: ProviderToken<State<T>>,
  options: CreateStateInjectorOptions = {},
): <U = T>(injectOptions?: InjectOptions) => Signal<State<U> | undefined> {
  return <U = T>(injectOptions: InjectOptions = {}) => {
    const value = inject(token, injectOptions) as Signal<State<U> | undefined> | null;

    if (options.deferred) {
      return computed(() =>
        value && Object.keys(value() ?? {}).length === 0 ? undefined : value?.(),
      ) as Signal<State<U> | undefined>;
    }

    return (value as Signal<State<U>>) ?? signal(undefined);
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
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);

        // if this is a getter or setter, we need to define it on the object
        if (descriptor?.get || descriptor?.set) {
          Object.defineProperty(obj, key, descriptor);
        } else if (typeof prototype[key as keyof U] === 'function') {
          (obj as Record<string, unknown>)[key] = prototype[key as keyof U].bind(state);
        } else {
          // @ts-ignore
          obj[key] = prototype[key as keyof U];
        }
      }

      return { ...obj };
    });

    return internalState() as unknown as CreatedState<U>;
  };
}
