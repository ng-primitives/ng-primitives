/**
 * NgpFocusable - Make any element focusable and properly handle disabled states
 *
 * ## Why This Primitive Exists
 *
 * Native HTML `<button>` elements have built-in keyboard support and disabled handling,
 * but many UI patterns require using non-semantic elements (like `<div>` or `<span>`)
 * as interactive controls. These elements lack:
 *
 * - Proper focus management (need `tabindex` to be focusable)
 * - Accessible disabled states (native `disabled` removes from tab order)
 *
 * Additionally, native `disabled` attribute has limitations:
 * - Removes elements from tab order entirely, causing focus to be lost
 * - Prevents screen readers from announcing the element in some contexts
 * - Cannot be used for loading states where focus should be retained
 *
 * ## Accessibility Problems Solved
 *
 * ### WCAG 2.1.1 - Keyboard Accessibility
 * All functionality must be operable through a keyboard interface. This primitive:
 * - Makes non-native elements focusable via `tabindex="0"`
 * - Blocks keyboard interactions (except Tab) when disabled but focusable
 *
 * For Enter/Space key activation on non-native elements, use `NgpButton` which builds
 * on this primitive.
 *
 * ### Focus Management for Disabled States
 * When using native `disabled`, focus is lost if the element was focused. This is problematic
 * for loading states (e.g., a submit button that disables after click). This primitive
 * provides `focusableWhenDisabled` which:
 * - Uses `aria-disabled` instead of `disabled` attribute
 * - Keeps element in tab order
 * - Blocks all interactions while appearing disabled
 * - Prevents focus from jumping unexpectedly
 *
 * ### Proper ARIA Semantics
 * - Sets `aria-disabled="true"` for non-native elements or focusable disabled buttons
 * - Manages `tabindex` appropriately based on element type and disabled state
 * - Applies `data-*` attributes for CSS styling hooks
 *
 * ## When to Use
 *
 * - Creating loading/pending states that need to retain focus
 * - Making any element focusable with proper disabled state handling
 * - As a foundation for button-like primitives (e.g., NgpButton, menu items, tabs)
 *
 * ## Inspiration
 *
 * Ported from Base UI's approach:
 * - https://github.com/mui/base-ui/blob/master/packages/react/src/utils/useFocusableWhenDisabled.ts
 * - https://github.com/mui/base-ui/blob/master/packages/react/src/use-button/useButton.ts
 *
 * ## References
 *
 * - MDN: Button Role - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role
 * - WCAG 2.1.1 Keyboard - https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
 * - MDN: aria-disabled - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled
 * - WAI-ARIA Button Pattern - https://www.w3.org/WAI/ARIA/apg/patterns/button/
 */
import { computed, isSignal, signal, Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, createPrimitive, listener } from 'ng-primitives/state';
import {
  isBoolean,
  isNativeButton,
  isNumber,
  isomorphicRenderEffect,
  isString,
  isUndefined,
} from 'ng-primitives/utils';
import { injectFocusableConfig, NgpFocusableConfig } from './focusable-config';

export interface NgpFocusableState {
  /**
   * Whether the element is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * Whether the element should be focusable even when disabled.
   */
  readonly focusableWhenDisabled: Signal<boolean>;

  /**
   * The tabindex attribute state value.
   */
  readonly tabIndex: Signal<number | null | undefined>;

  /**
   * The aria-disabled attribute state value.
   */
  readonly ariaDisabled: Signal<boolean | string | null | undefined>;

  /**
   * Set the disabled state of the element.
   * @param value The disabled state.
   */
  setDisabled(value: boolean): void;

  /**
   * Set whether the element should remain focusable when disabled.
   * @param value Whether to keep the element focusable when disabled.
   */
  setFocusableWhenDisabled(value: boolean): void;

  /**
   * Set the tabindex attribute state value.
   * @param value The tabindex attribute value.
   */
  setTabIndex(value: number | null | undefined): void;

  /**
   * Set the aria-disabled attribute state value.
   * @param value The aria-disabled attribute value.
   */
  setAriaDisabled(value: boolean | string | null | undefined): void;
}

export interface NgpFocusableProps {
  /**
   * Whether the element is disabled.
   *
   * When `true`:
   * - Click events are blocked via `preventDefault()` and `stopImmediatePropagation()`
   * - Keyboard interactions are blocked (except Tab when `focusableWhenDisabled` is true)
   * - `data-disabled` attribute is applied for styling
   * - Native `disabled` attribute is set (if element supports it and not focusable when disabled)
   */
  readonly disabled?: Signal<boolean>;

  /**
   * Whether the element should remain focusable when disabled.
   *
   * This is essential for loading states where focus should not be lost.
   * When `true`:
   * - Element stays in the tab order
   * - `aria-disabled="true"` is used instead of `disabled` attribute
   * - Only Tab key is allowed for keyboard navigation
   * - Focus is not lost when transitioning to disabled state
   *
   * @remarks
   * Use this for submit buttons that show a loading spinner after click.
   * Without this, focus jumps away when the button becomes disabled,
   * which is disorienting for keyboard and screen readers.
   */
  readonly focusableWhenDisabled?: Signal<boolean>;

  /**
   * The tabindex attribute value to set on the element.
   * @remarks
   * A non-undefined value will override the automatically managed tabindex attribute.
   */
  readonly tabIndex?: number | null | Signal<number | null | undefined>;

  /**
   * The aria-disabled attribute value to set on the element.
   * @remarks
   * A non-undefined value will override the automatically managed aria-disabled attribute.
   */
  readonly ariaDisabled?: boolean | string | null | Signal<boolean | string | null | undefined>;

  /**
   * Override the default configuration for the focusable element.
   */
  readonly config?: Partial<NgpFocusableConfig>;
}

export const [NgpFocusableStateToken, ngpFocusable, injectFocusableState, provideFocusableState] =
  createPrimitive(
    'NgpFocusable',
    ({
      disabled: _disabled = signal(false),
      focusableWhenDisabled: _focusableWhenDisabled = signal(false),
      tabIndex: _tabIndex,
      ariaDisabled: _ariaDisabled,
      config: _config,
    }: NgpFocusableProps): NgpFocusableState => {
      const element = injectElementRef();
      const isButton = isNativeButton(element);

      const { autoManageAriaDisabled, autoManageTabIndex } = {
        ...injectFocusableConfig(),
        ..._config,
      };

      const disabled = controlled(_disabled);
      const focusableWhenDisabled = controlled(_focusableWhenDisabled);
      const tabIndex = controlled(isSignal(_tabIndex) ? _tabIndex : signal(_tabIndex));
      const ariaDisabled = controlled(
        isSignal(_ariaDisabled) ? _ariaDisabled : signal(_ariaDisabled),
      );

      /** The element should be completely disabled, including focusing and interactions. */
      const hardDisabled = computed(() => disabled() && !focusableWhenDisabled());

      ngpInteractions({
        hover: true,
        press: true,
        focusVisible: true,
        disabled: hardDisabled,
      });

      isomorphicRenderEffect({
        write: () => {
          if (disabled()) {
            element.nativeElement.setAttribute('data-disabled', '');
          } else {
            element.nativeElement.removeAttribute('data-disabled');
          }
        },
      });

      isomorphicRenderEffect({
        write: () => {
          if (focusableWhenDisabled()) {
            element.nativeElement.setAttribute('data-focusable-when-disabled', '');
          } else {
            element.nativeElement.removeAttribute('data-focusable-when-disabled');
          }
        },
      });

      // Ensure the disabled attribute is set correctly on the button element
      // When used with other primitives, this overrides the disabled attribute set by the primitive
      if (isButton) {
        isomorphicRenderEffect({
          write: () => {
            element.nativeElement.disabled = hardDisabled();
          },
        });
      }

      // Cache to avoid unnecessary re-renders
      const tabIndexCached = computed(() => {
        const value = tabIndex();
        if (!isUndefined(value)) {
          return value;
        }

        if (!autoManageTabIndex) {
          return undefined;
        }

        if (!isButton && disabled()) {
          return focusableWhenDisabled() ? 0 : -1;
        }

        return 0;
      });

      // tabindex="0" makes non-native elements keyboard focusable (WCAG 2.1.1).
      // tabindex="-1" removes from tab order when disabled.
      isomorphicRenderEffect({
        write: () => {
          const value = tabIndexCached();
          if (isNumber(value)) {
            element.nativeElement.tabIndex = value;
          } else if (value === null) {
            element.nativeElement.removeAttribute('tabindex');
          }
        },
      });

      // Cache to avoid unnecessary re-renders
      const ariaDisabledCached = computed(() => {
        const value = ariaDisabled();
        if (!isUndefined(value)) {
          return value;
        }

        if (!autoManageAriaDisabled) {
          return undefined;
        }

        if ((isButton && focusableWhenDisabled()) || (!isButton && disabled())) {
          return disabled();
        }

        return false;
      });

      // aria-disabled communicates disabled state to assistive tech without preventing focus
      isomorphicRenderEffect({
        write: () => {
          const value = ariaDisabledCached();
          if (isBoolean(value)) {
            element.nativeElement.ariaDisabled = value ? 'true' : null;
          } else if (isString(value)) {
            element.nativeElement.ariaDisabled = value;
          } else if (value === null) {
            element.nativeElement.removeAttribute('aria-disabled');
          }
        },
      });

      // Allow tabbing away from focusable elements, block everything else
      listener(element, 'keydown', event => {
        if (disabled() && focusableWhenDisabled() && event.key !== 'Tab') {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      return {
        disabled: disabled.asReadonly(),
        focusableWhenDisabled: focusableWhenDisabled.asReadonly(),
        tabIndex: tabIndex.asReadonly(),
        ariaDisabled: ariaDisabled.asReadonly(),
        setDisabled: value => disabled.set(value),
        setFocusableWhenDisabled: value => focusableWhenDisabled.set(value),
        setTabIndex: value => tabIndex.set(value),
        setAriaDisabled: value => ariaDisabled.set(value),
      } satisfies NgpFocusableState;
    },
  );
