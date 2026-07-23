import { computed, inject, Injector, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, dataBinding, listener } from 'ng-primitives/state';

export interface NgpSearchState {
  /**
   * Whether the search field is empty.
   * @internal
   */
  readonly empty: Signal<boolean>;

  /**
   * Clear the search field.
   */
  clear(): void;

  /**
   * Register the input field with the search.
   * @internal
   */
  registerInput(input: HTMLInputElement): void;
}

export const [NgpSearchStateToken, ngpSearch, injectSearchState, provideSearchState] =
  createPrimitive('NgpSearch', (): NgpSearchState => {
    const element = injectElementRef<HTMLElement>();
    const injector = inject(Injector);

    /** The registered input field. */
    const input = signal<HTMLInputElement | null>(null);

    /** The current value of the input. */
    const value = signal<string>('');

    /** Whether the input field is empty. */
    const empty = computed(() => value() === '');

    // Reflect the empty state on the host.
    dataBinding(element, 'data-empty', empty);

    // Clear the field on Escape. The listener sits on the container, so the
    // keydown bubbles up from the input.
    listener(element, 'keydown', (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clear();
      }
    });

    function clear(): void {
      const el = input();

      // a disabled input must not be clearable (via Escape or the clear button)
      if (!el || el.disabled) {
        return;
      }

      el.value = '';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }

    function registerInput(el: HTMLInputElement): void {
      input.set(el);
      value.set(el.value);

      // Track the value as the user types. Cleanup is tied to the search's
      // lifecycle via its injector, not the input's.
      listener(el, 'input', () => value.set(el.value), { injector });
    }

    return { empty, clear, registerInput } satisfies NgpSearchState;
  });
