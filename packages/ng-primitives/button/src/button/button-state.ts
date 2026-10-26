import { computed, HOST_TAG_NAME, inject, signal, Signal } from '@angular/core';
import { ngpFocusVisible, ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, createPrimitive, dataBinding } from 'ng-primitives/state';

export interface NgpButtonState {
  /** Disabled state. `'soft'` means aria-disabled but still focusable. */
  readonly disabled: Signal<boolean | 'soft'>;

  /** Set the disabled state. `'soft'` keeps the button focusable. */
  setDisabled(value: boolean | 'soft'): void;

  /**
   * Fully disable the button while `source` is true, on top of its own disabled state.
   * @internal
   */
  registerDisabledSource(source: Signal<boolean>): void;

  /**
   * Stop following a source added with `registerDisabledSource`.
   * @internal
   */
  unregisterDisabledSource(source: Signal<boolean>): void;
}

export interface NgpButtonProps {
  /** Disabled state. `'soft'` means aria-disabled but still focusable. */
  readonly disabled?: Signal<boolean | 'soft'>;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive(
    'NgpButton',
    ({ disabled: _disabled = signal(false) }: NgpButtonProps): NgpButtonState => {
      const element = injectElementRef();
      const isButton = inject(HOST_TAG_NAME) === 'button';
      const disabled = controlled(_disabled);

      // Another part on the same element (e.g. a search clear button) can disable
      // the button without overriding the consumer's own disabled binding.
      const disabledSources = signal<readonly Signal<boolean>[]>([]);
      const disabledBySource = computed(() => disabledSources().some(source => source()));

      const hardDisabled = computed(() => disabled() === true || disabledBySource());
      const softDisabled = computed(() => disabled() === 'soft' && !hardDisabled());
      const anyDisabled = computed(() => hardDisabled() || softDisabled());

      ngpInteractions({ hover: true, press: true, disabled: anyDisabled });

      // Soft-disabled stays focusable, so only suppress focus-visible when fully disabled.
      ngpFocusVisible({ disabled: hardDisabled });

      dataBinding(element, 'data-disabled', () => (softDisabled() ? 'soft' : hardDisabled()));

      if (isButton) {
        attrBinding(element, 'disabled', () => (hardDisabled() ? '' : null));
        attrBinding(element, 'aria-disabled', () => (softDisabled() ? 'true' : null));
      } else {
        attrBinding(element, 'aria-disabled', () => (anyDisabled() ? 'true' : null));
      }

      function setDisabled(value: boolean | 'soft'): void {
        disabled.set(value);
      }

      function registerDisabledSource(source: Signal<boolean>): void {
        disabledSources.update(sources => [...sources, source]);
      }

      function unregisterDisabledSource(source: Signal<boolean>): void {
        disabledSources.update(sources => {
          const index = sources.indexOf(source);
          return index === -1 ? sources : [...sources.slice(0, index), ...sources.slice(index + 1)];
        });
      }

      return {
        disabled: disabled.asReadonly(),
        setDisabled,
        registerDisabledSource,
        unregisterDisabledSource,
      } satisfies NgpButtonState;
    },
  );
