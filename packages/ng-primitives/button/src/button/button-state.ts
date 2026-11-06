import { computed, HOST_TAG_NAME, inject, signal, Signal } from '@angular/core';
import { ngpFocusVisible, ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
} from 'ng-primitives/state';
import { onChange, uniqueId } from 'ng-primitives/utils';
import { NgpButtonAnnouncer } from './button-announcer';

export interface NgpButtonState {
  /** Disabled state. `'soft'` means aria-disabled but still focusable. */
  readonly disabled: Signal<boolean | 'soft'>;

  /** Whether the button is pending. A pending button stays focusable but ignores presses. */
  readonly pending: Signal<boolean>;

  /** Set the disabled state. `'soft'` keeps the button focusable. */
  setDisabled(value: boolean | 'soft'): void;

  /** Set the pending state. */
  setPending(value: boolean): void;

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

  /** Whether the button is pending. A pending button stays focusable but ignores presses. */
  readonly pending?: Signal<boolean>;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive(
    'NgpButton',
    ({
      disabled: _disabled = signal(false),
      pending: _pending = signal(false),
    }: NgpButtonProps): NgpButtonState => {
      const element = injectElementRef();
      const isButton = inject(HOST_TAG_NAME) === 'button';
      const announcer = inject(NgpButtonAnnouncer);
      const disabled = controlled(_disabled);
      const pending = controlled(_pending);

      // Another part on the same element (e.g. a search clear button) can disable
      // the button without overriding the consumer's own disabled binding.
      const disabledSources = signal<readonly Signal<boolean>[]>([]);
      const disabledBySource = computed(() => disabledSources().some(source => source()));

      const hardDisabled = computed(() => disabled() === true || disabledBySource());
      const softDisabled = computed(() => disabled() === 'soft' && !hardDisabled());
      const anyDisabled = computed(() => hardDisabled() || softDisabled());

      ngpInteractions({
        hover: true,
        press: true,
        disabled: computed(() => anyDisabled() || pending()),
      });

      // Soft-disabled and pending stay focusable, so only suppress focus-visible when fully disabled.
      ngpFocusVisible({ disabled: hardDisabled });

      dataBinding(element, 'data-disabled', () => (softDisabled() ? 'soft' : hardDisabled()));
      dataBinding(element, 'data-pending', pending);

      if (isButton) {
        attrBinding(element, 'disabled', () => (hardDisabled() ? '' : null));
        attrBinding(element, 'aria-disabled', () =>
          softDisabled() || (pending() && !hardDisabled()) ? 'true' : null,
        );
      } else {
        attrBinding(element, 'aria-disabled', () => (anyDisabled() || pending() ? 'true' : null));
      }

      // Capture runs before the consumer's `(click)` on the same element. Cancelling the click
      // keeps a submit button from submitting its form, including on Enter in a form field,
      // while it stays the form's default button. `auxclick` covers a middle click on a link.
      function cancelWhilePending(event: Event): void {
        if (pending()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }
      listener(element, 'click', cancelWhilePending, { config: { capture: true } });
      listener(element, 'auxclick', cancelWhilePending, { config: { capture: true } });

      onChange(pending, (_, previous) => {
        if (previous === null || !element.nativeElement.matches(':focus')) {
          return;
        }
        element.nativeElement.id ||= uniqueId('ngp-button');
        announcer.announceName(element.nativeElement.id);
      });

      function setDisabled(value: boolean | 'soft'): void {
        disabled.set(value);
      }

      function setPending(value: boolean): void {
        pending.set(value);
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
        pending: pending.asReadonly(),
        setDisabled,
        setPending,
        registerDisabledSource,
        unregisterDisabledSource,
      } satisfies NgpButtonState;
    },
  );
