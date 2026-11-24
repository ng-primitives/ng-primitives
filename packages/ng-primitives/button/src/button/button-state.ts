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

  /**
   * Set `aria-disabled` while `source` is true, and `data-disabled` too when `kind` is
   * `'announced-and-styled'`. The button stays focusable and pressable.
   * @internal
   */
  registerAriaDisabledSource(source: Signal<boolean>, kind?: NgpButtonAriaDisabledSourceKind): void;

  /**
   * Stop following a source added with `registerAriaDisabledSource`.
   * @internal
   */
  unregisterAriaDisabledSource(source: Signal<boolean>): void;
}

/**
 * What the button sets while a source added with `registerAriaDisabledSource` is true.
 * @internal
 */
export type NgpButtonAriaDisabledSourceKind =
  /** `aria-disabled` only. */
  | 'announced'
  /** `aria-disabled` and `data-disabled`. */
  | 'announced-and-styled';

/** What the button sets while a registered source is true. */
type DisabledSourceKind =
  /** Fully disabled, as by the button's own `disabled`: not focusable or pressable, `data-disabled`. */
  'disabled' | NgpButtonAriaDisabledSourceKind;

const ARIA_DISABLED_SOURCE_KINDS: readonly DisabledSourceKind[] = [
  'announced',
  'announced-and-styled',
];

/** A signal another part on the element registered, and what it asks of the button while true. */
interface DisabledSource {
  readonly active: Signal<boolean>;
  readonly kind: DisabledSourceKind;
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

      // Another part on the same element can disable the button (e.g. a search clear button)
      // or only announce it as disabled (e.g. a collapsible trigger), without overriding the
      // consumer's own disabled binding. Read in the bindings, so the list is one signal per button.
      const sources = signal<readonly DisabledSource[]>([]);

      const activeSourceKinds = computed(
        () => new Set(sources().flatMap(source => (source.active() ? [source.kind] : []))),
      );

      const hardDisabled = computed(
        () => disabled() === true || activeSourceKinds().has('disabled'),
      );
      const softDisabled = computed(() => disabled() === 'soft' && !hardDisabled());
      const anyDisabled = computed(() => hardDisabled() || softDisabled());
      const announcedDisabled = computed(
        () => softDisabled() || pending() || activeSourceKinds().size > 0,
      );

      ngpInteractions({
        hover: true,
        press: true,
        disabled: computed(() => anyDisabled() || pending()),
      });

      // Soft-disabled and pending stay focusable, so only suppress focus-visible when fully disabled.
      ngpFocusVisible({ disabled: hardDisabled });

      dataBinding(element, 'data-disabled', () =>
        softDisabled() ? 'soft' : hardDisabled() || activeSourceKinds().has('announced-and-styled'),
      );
      dataBinding(element, 'data-pending', pending);

      if (isButton) {
        attrBinding(element, 'disabled', () => (hardDisabled() ? '' : null));
        // The native disabled attribute already announces a fully disabled button.
        attrBinding(element, 'aria-disabled', () =>
          announcedDisabled() && !hardDisabled() ? 'true' : null,
        );
      } else {
        attrBinding(element, 'aria-disabled', () =>
          announcedDisabled() || hardDisabled() ? 'true' : null,
        );
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

      function registerSource(source: DisabledSource): void {
        sources.update(current => [...current, source]);
      }

      /** Remove one entry: the same signal may be registered more than once, and as other kinds. */
      function unregisterSource(
        active: Signal<boolean>,
        kinds: readonly DisabledSourceKind[],
      ): void {
        sources.update(current => {
          const index = current.findIndex(
            // A source is found by the signal it was registered with, not by the signal's value.
            // eslint-disable-next-line @angular-eslint/no-uncalled-signals
            source => kinds.includes(source.kind) && source.active === active,
          );
          return index === -1 ? current : current.filter((_, at) => at !== index);
        });
      }

      return {
        disabled: disabled.asReadonly(),
        pending: pending.asReadonly(),
        setDisabled,
        setPending,
        registerDisabledSource: active => registerSource({ active, kind: 'disabled' }),
        unregisterDisabledSource: active => unregisterSource(active, ['disabled']),
        registerAriaDisabledSource: (active, kind = 'announced') =>
          registerSource({ active, kind }),
        unregisterAriaDisabledSource: active =>
          unregisterSource(active, ARIA_DISABLED_SOURCE_KINDS),
      } satisfies NgpButtonState;
    },
  );
