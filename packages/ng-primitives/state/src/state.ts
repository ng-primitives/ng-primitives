import {
  FactoryProvider,
  inject,
  InjectionToken,
  isSignal,
  linkedSignal,
  OutputEmitterRef,
  ProviderToken,
  Signal,
  WritableSignal,
} from '@angular/core';

/**
 * This ensures that properties of the state object are either signals or output emitters.
 */
type State<T> = {
  [K in keyof T]: T[K] extends Signal<unknown> | OutputEmitterRef<unknown> ? T[K] : never;
};

/**
 * This converts the state object to a writable state object.
 * This means that inputs become signals which are writable.
 */
type WritableState<T> = {
  [K in keyof T]: T[K] extends Signal<infer U> ? WritableSignal<U> : T[K];
};

/**
 * Create a new injection token for the state.
 * @param description The description of the token
 */
function createStateToken<T>(description: string): InjectionToken<T> {
  return new InjectionToken<WritableState<T>>(description);
}

/**
 * Create a new provider for the state. It first tries to inject the state from the parent injector,
 * as this allows for the state to be hoisted to a higher level in the component tree. This can
 * be useful to avoid issues where the injector can't be shared in some cases when ng-content is used.
 * @param token The token for the state
 */
function createStateProvider<T>(token: ProviderToken<T>): () => FactoryProvider {
  return () => ({
    provide: token,
    useFactory: () => inject(token, { optional: true, skipSelf: true }) ?? {},
  });
}

/**
 * Convert the original state object into a writable state object.
 * @param token The token for the state
 */
function createWritableState<T>(token: ProviderToken<WritableState<T>>) {
  return (state: State<T>): WritableState<T> => {
    const internalState = inject(token);

    for (const key in state) {
      const value = state[key];

      // @ts-ignore
      internalState[key] = isSignal(value) ? linkedSignal(() => value()) : value;
    }

    return internalState;
  };
}

/**
 * This takes a string and creates the custom return type for the primitive.
 * @param name The name of the primitive
 */
type StateFactory<T extends string, U> = {
  [K in `${Uncapitalize<T>}State`]: string;
} & {
  [K in `Ngp${Capitalize<T>}StateToken`]: InjectionToken<WritableState<U>>;
} & {
  [K in `provide${Capitalize<T>}State`]: () => FactoryProvider;
};

/**
 * Capitalize the first letter of a string.
 * @param value The value to capitalize
 */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Uncapitalize the first letter of a string.
 * @param value The value to uncapitalize
 */
function uncapitalize(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

/**
 * Create the required state values for the primitive
 * @param name The name of the state
 * @internal
 */
export function createState<U, T extends string = string>(name: T): StateFactory<T, U> {
  const token = createStateToken<T>(`Ngp${capitalize(name)}StateToken`);
  return {
    [`Ngp${capitalize(name)}StateToken`]: token,
    [`provide${capitalize(name)}State`]: createStateProvider(token),
    [`${uncapitalize(name)}State`]: createWritableState(token),
  } as StateFactory<T, U>;
}
