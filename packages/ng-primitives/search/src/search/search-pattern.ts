import {
  computed,
  effect,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  InjectOptions,
  signal,
  Signal,
  Type,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, dataBinding, listener, onPress } from 'ng-primitives/state';

/**
 * The state interface for the Search pattern.
 */
export interface NgpSearchState {
  /**
   * The search input value.
   */
  value: Signal<string>;

  /**
   * Whether the search input is empty.
   */
  empty: Signal<boolean>;
  /**
   * Clear method.
   */
  clear: () => void;

  /**
   * Register the input field.
   */
  registerInput: (input: HTMLInputElement) => void;
}

/**
 * The props interface for the Search pattern.
 */
export interface NgpSearchProps {
  /**
   * The element reference for the search.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * The input reference for the search.
   */
  input?: Signal<HTMLInputElement | null>;
}

/**
 * The Search pattern function.
 */
export function ngpSearchPattern({
  element = injectElementRef(),
  input: _input = signal<HTMLInputElement | null>(null),
}: NgpSearchProps): NgpSearchState {
  const input = controlled(_input);
  const value = signal<string>('');

  // Computed properties
  const empty = computed(() => value() === '');

  effect(() => {
    const inputField = input();

    if (!inputField) {
      value.set('');
      return;
    }

    value.set(inputField.value);

    listener(inputField, 'input', () => value.set(inputField.value));
  });

  // Host bindings
  dataBinding(element, 'data-empty', empty);

  // Host listeners
  onPress(element, 'Escape', clear);

  function registerInput(inputField: HTMLInputElement): void {
    input.set(inputField);
  }

  // Method implementations
  function clear(): void {
    const inputField = input();

    if (!inputField) {
      return;
    }

    inputField.value = '';
    inputField.dispatchEvent(new Event('input', { bubbles: true }));
  }

  return {
    value,
    empty,
    clear,
    registerInput,
  };
}

/**
 * The injection token for the Search pattern.
 */
export const NgpSearchPatternToken = new InjectionToken<NgpSearchState>('NgpSearchPatternToken');

/**
 * Injects the Search pattern.
 */
export function injectSearchPattern(): NgpSearchState;
export function injectSearchPattern({ optional }: InjectOptions): NgpSearchState | null;
export function injectSearchPattern({ optional }: InjectOptions = {}): NgpSearchState | null {
  return inject(NgpSearchPatternToken, { optional });
}

/**
 * Provides the Search pattern.
 */
export function provideSearchPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpSearchState,
): FactoryProvider {
  return { provide: NgpSearchPatternToken, useFactory: () => fn(inject(type)) };
}
