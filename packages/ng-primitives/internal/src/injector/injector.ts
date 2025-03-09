import {
  ExistingProvider,
  FactoryProvider,
  inject,
  InjectOptions,
  ProviderToken,
  ValueProvider,
} from '@angular/core';

/**
 * This is a custom injector that is used instead of the Angular injector. This allows us to
 * bypass the limitation where the Angular injector does not allow us to provide dependencies
 * when using ng-content (https://github.com/angular/angular/issues/42649), and the Angular
 * injector is immutable.
 */
export class NgpInjector {
  private constructor(
    private readonly _providers: StaticProvider[],
    private readonly _parent: NgpInjector | null | undefined,
  ) {}

  static create(options: InjectorCreateOptions): NgpInjector {
    return new NgpInjector(options.providers, options.parent);
  }

  /**
   * Gets an instance from the injector.
   * @param token Token that determines what to get from the injector.
   * @param options Options that can be used to configure the retrieval.
   * @returns Instance from the injector.
   */
  get<T>(
    token: ProviderToken<T>,
    options: InjectOptions & {
      optional?: false;
    },
  ): T;
  get<T>(token: ProviderToken<T>, options?: InjectOptions): T;
  get<T>(token: ProviderToken<T>, options?: InjectOptions): T | null {
    const provider = this._providers.find(p => p.provide === token);

    if (provider) {
      if (isValueProvider(provider)) {
        return provider.useValue;
      }

      if (isExistingProvider(provider)) {
        return this.get(provider.useExisting, options);
      }
    }

    if (this._parent) {
      return this._parent.get(token, options);
    }

    if (options?.optional) {
      return null;
    }

    throw new Error(`No provider found for token ${token.toString()}`);
  }

  /**
   * Registers a provider in the injector.
   * @param provider Provider to register.
   */
  register(provider: StaticProvider): void {
    this._providers.push(provider);
  }
}

type InjectorCreateOptions = {
  providers: StaticProvider[];
  parent?: NgpInjector | null;
};

type StaticProvider = ValueProvider | ExistingProvider;

function isValueProvider(provider: StaticProvider): provider is ValueProvider {
  return (provider as ValueProvider).useValue !== undefined;
}

function isExistingProvider(provider: StaticProvider): provider is ExistingProvider {
  return (provider as ExistingProvider).useExisting !== undefined;
}

/**
 * Injects a dependency from the Angular injector or the custom injector.
 * @param token Token that determines what to inject.
 * @param options Options that can be used to configure the injection.
 * @returns Injected dependency.
 */
export function ngpInject<T>(
  token: ProviderToken<T>,
  options?: InjectOptions & {
    optional?: false;
  },
): T;
export function ngpInject<T>(token: ProviderToken<T>, options?: InjectOptions): T | null {
  const ngpInjector = inject(NgpInjector, { optional: true });

  // first check the ngpInjector if there is one
  if (ngpInjector) {
    const value = ngpInjector.get<T>(token as ProviderToken<T>, { optional: true });

    if (value !== null && value !== undefined) {
      return value;
    }
  }

  // if not found, fallback to the Angular injector
  return inject(token, options ?? {});
}

export function provideNgpInjector(): FactoryProvider {
  const parentNgpInjector = inject(NgpInjector, { optional: true, skipSelf: true });

  return {
    provide: NgpInjector,
    useFactory: () => NgpInjector.create({ providers: [], parent: parentNgpInjector }),
  };
}

/**
 * Provides a value in the Angular injector and the custom injector.
 * @param token Token that determines what to provide.
 * @param value Value to provide.
 * @returns Provider for the value.
 */
export function provideNgpToken<T, V>(token: ProviderToken<T>, value: V): FactoryProvider {
  return {
    provide: token,
    useFactory: () => {
      const ngpInjector = inject(NgpInjector, { optional: true });

      if (ngpInjector) {
        ngpInjector.register({ provide: token, useExisting: value });
      }

      return inject(value as ProviderToken<V>); // Ensure we return the correct instance
    },
  };
}
