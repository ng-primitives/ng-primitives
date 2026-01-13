/**
 * @license
 * Copyright Angular Primitives Contributors
 * SPDX-License-Identifier: MIT
 *
 * NgpActionable - Make any element keyboard-accessible and properly handle disabled states
 *
 * ## Why This Primitive Exists
 *
 * Native HTML `<button>` elements have built-in keyboard support and disabled handling,
 * but many UI patterns require using non-semantic elements (like `<div>` or `<span>`)
 * as interactive controls. These elements lack:
 *
 * - Keyboard operability (Enter/Space activation)
 * - Proper focus management
 * - Accessible disabled states
 *
 * Additionally, native `disabled` attribute has limitations:
 * - Removes elements from tab order entirely, causing focus to be lost
 * - Prevents screen readers from announcing the element in some contexts
 * - Cannot be used for loading states where focus should be retained
 *
 * ## Accessibility Problems Solved
 *
 * ### WCAG 2.1.1 - Keyboard Accessibility
 * All functionality must be operable through a keyboard interface. This primitive adds
 * Enter and Space key activation to non-native elements, matching native button behavior:
 * - Enter activates immediately on keydown
 * - Space activates on keyup (allowing cancellation by moving pointer away)
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
 * - Building custom button-like components on non-button elements
 * - Creating loading/pending states that need to retain focus
 * - Making any clickable element keyboard accessible
 * - Primitives that compose button-like behavior (e.g., menu items, tabs, toolbar buttons)
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
import { coerceElement } from '@angular/cdk/coercion';
import { ElementRef, inject, Injector, runInInjectionContext, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { attrBinding, controlled, dataBinding, listener } from 'ng-primitives/state';
import { signalMethod, SignalMethod } from 'ng-primitives/utils';

/**
 * The state object returned by `ngpActionable()`.
 *
 * Provides reactive signals for the element's actionable properties and
 * methods to imperatively update them.
 */
export interface NgpActionableState {
  /**
   * Whether the element is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * Whether the element should be focusable even when disabled.
   *
   * @remarks
   * For buttons that enter a loading state after being clicked, set to
   * true to ensure focus remains on the button when it becomes disabled.
   * This prevents focus from being lost and maintains the tab order.
   */
  readonly focusableWhenDisabled: Signal<boolean>;

  /**
   * The `aria-disabled` attribute value of the element.
   */
  readonly ariaDisabled: Signal<boolean | null>;

  /**
   * The tab index of the element.
   */
  readonly tabIndex: Signal<number | null>;

  /**
   * Set the disabled state of the element.
   * @param value The disabled state.
   */
  readonly setDisabled: SignalMethod<boolean>;

  /**
   * Set the focusable state of the element.
   * @param value The focusable state.
   */
  readonly setFocusableWhenDisabled: SignalMethod<boolean>;

  /**
   * Set the aria-disabled state of the element.
   * @param value The aria-disabled state.
   */
  readonly setAriaDisabled: SignalMethod<boolean | null>;

  /**
   * Set the tab index of the element.
   * @param value The tab index.
   */
  readonly setTabIndex: SignalMethod<number | null>;
}

/**
 * Configuration options for `ngpActionable()`.
 *
 * All properties accept Angular signals, allowing reactive updates to the element's state.
 * Properties are optional - sensible defaults are applied when not provided.
 */
export interface NgpActionableProps {
  /**
   * Whether the element is disabled.
   *
   * When `true`:
   * - Click events are blocked via `preventDefault()` and `stopImmediatePropagation()`
   * - Keyboard interactions are blocked (except Tab when `focusableWhenDisabled` is true)
   * - `data-disabled` attribute is applied for styling
   * - Native `disabled` attribute is set (if element supports it and not focusable when disabled)
   *
   * @default signal(false)
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
   * which is disorienting for keyboard and screen reader users.
   *
   * @default signal(false)
   */
  readonly focusableWhenDisabled?: Signal<boolean>;

  /**
   * Override the automatic `aria-disabled` attribute management.
   *
   * By default, `aria-disabled` is automatically set based on the element type
   * and disabled state. Use this to manually control the attribute when needed.
   *
   * @default signal(null) - automatic management based on disabled state
   */
  readonly ariaDisabled?: Signal<boolean | null>;

  /**
   * Override the automatic `tabindex` attribute management.
   *
   * By default:
   * - Native buttons use their default tabindex behavior
   * - Non-native elements get `tabindex="0"` to be keyboard focusable
   * - Disabled non-focusable elements get `tabindex="-1"`
   *
   * Use this to manually control the tab order when needed.
   *
   * @default signal(null) - automatic management
   */
  readonly tabIndex?: Signal<number | null>;
}

/**
 * WeakMap storing the state for each element.
 * Using WeakMap ensures state is garbage collected when the element is removed.
 */
const actionableStateMap = new WeakMap<HTMLElement, NgpActionableState>();

/**
 * Makes an element actionable with proper keyboard accessibility and disabled state handling.
 *
 * This function can be used in two ways:
 *
 * 1. **Initial setup**: Creates a new actionable state for the element with the provided
 *    configuration. Sets up all event listeners, ARIA attributes, and data bindings.
 *
 * 2. **State retrieval/update**: If called again for the same element, returns the existing
 *    state and optionally updates it with new signal bindings.
 *
 * @example
 * ```typescript
 * // Basic usage in a directive or component
 * const state = ngpActionable({
 *   disabled: this.disabled,
 *   focusableWhenDisabled: this.focusableWhenDisabled,
 * });
 *
 * // Later, check if disabled
 * if (state.disabled()) {
 *   // Handle disabled state
 * }
 *
 * // Imperatively update state
 * state.setDisabled(true);
 * ```
 *
 * @example
 * ```typescript
 * // For loading button that retains focus
 * const state = ngpActionable({
 *   disabled: computed(() => this.isLoading()),
 *   focusableWhenDisabled: signal(true),
 * });
 * ```
 *
 * @param props - Configuration options for the actionable behavior
 * @param opts - Additional options like custom injector or element reference
 * @returns The actionable state object with signals and setter methods
 */
export function ngpActionable(
  {
    disabled: _disabled,
    focusableWhenDisabled: _focusable,
    ariaDisabled: _ariaDisabled,
    tabIndex: _tabIndex,
  }: NgpActionableProps = {},
  opts: {
    injector?: Injector;
    element?: ElementRef<HTMLElement>;
  } = {},
): NgpActionableState {
  const injector = opts?.injector ?? inject(Injector);
  return runInInjectionContext(injector, () => {
    const elementRef = opts.element ?? injectElementRef();
    const element = coerceElement(elementRef);
    const state = actionableStateMap.get(element);

    if (state) {
      if (_disabled) {
        state.setDisabled(_disabled);
      }
      if (_focusable) {
        state.setFocusableWhenDisabled(_focusable);
      }
      if (_ariaDisabled) {
        state.setAriaDisabled(_ariaDisabled);
      }
      if (_tabIndex) {
        state.setTabIndex(_tabIndex);
      }
      return state;
    }

    const disabled = _disabled ? controlled(_disabled) : signal(false);
    const focusable = _focusable ? controlled(_focusable) : signal(false);
    const ariaDisabled = _ariaDisabled ? controlled(_ariaDisabled) : signal(null);
    const tabIndex = _tabIndex ? controlled(_tabIndex) : signal(null);

    const tagName = element.tagName.toLowerCase();
    const isButton = tagName === 'button';
    const supportsDisabledAttribute = 'disabled' in element;

    // Setup host attribute bindings
    dataBinding(elementRef, 'data-disabled', disabled);
    dataBinding(elementRef, 'data-focusable-when-disabled', focusable);

    if (supportsDisabledAttribute) {
      attrBinding(elementRef, 'disabled', () => (disabled() && !focusable() ? '' : null));
    }

    // tabindex="0" makes non-native elements keyboard focusable (WCAG 2.1.1).
    // tabindex="-1" removes from tab order when disabled.
    attrBinding(elementRef, 'tabindex', () => {
      if (tabIndex() != null) {
        return tabIndex();
      }

      if (!isButton && disabled()) {
        return focusable() ? 0 : -1;
      }

      return 0;
    });

    // aria-disabled communicates disabled state to assistive tech without preventing focus
    attrBinding(elementRef, 'aria-disabled', () => {
      if (ariaDisabled() != null) {
        return ariaDisabled();
      }

      if ((isButton && focusable()) || (!isButton && disabled())) {
        return disabled() ? true : null;
      }

      return null;
    });

    // Prevent click events when disabled - stopImmediatePropagation ensures
    // user-defined click handlers don't fire on disabled buttons
    listener(elementRef, 'click', event => {
      if (disabled()) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });

    // Non-native elements don't respond to Enter/Space by default
    // WCAG 2.1.1 requires keyboard operability for all interactive elements
    listener(elementRef, 'keydown', event => {
      if (disabled()) {
        // Allow tabbing away from focusable elements, block everything else
        if (focusable() && event.key !== 'Tab') {
          event.preventDefault();
        }
        return;
      }

      const isValidLink = tagName === 'a' && element.getAttribute('href');
      const shouldActivate = event.target === event.currentTarget && !isButton && !isValidLink;
      const isEnterKey = event.key === 'Enter';
      const isSpaceKey = event.key === ' ';

      if (shouldActivate && (isSpaceKey || isEnterKey)) {
        event.preventDefault();

        // Enter activates immediately on keydown (like native buttons)
        // Space activates on keyup (handled separately) to allow cancellation
        if (isEnterKey) {
          element.click();
        }
      }
    });

    // Space activates on keyup (like native buttons) to allow cancellation.
    listener(elementRef, 'keyup', event => {
      // calling preventDefault in keyUp on a <button> will not dispatch a click event if Space is pressed
      // https://codesandbox.io/p/sandbox/button-keyup-preventdefault-dn7f0
      // Keyboard accessibility for non interactive elements
      if (event.target === event.currentTarget && !isButton && !disabled() && event.key === ' ') {
        element.click();
      }
    });

    // Prevent text selection and other default behaviors when clicking disabled buttons
    listener(elementRef, 'pointerdown', event => {
      if (disabled()) {
        event.preventDefault();
      }
    });

    const setDisabled = signalMethod((value: boolean) => {
      disabled.set(value);
    });

    const setFocusableWhenDisabled = signalMethod((value: boolean) => {
      focusable.set(value);
    });

    const setAriaDisabled = signalMethod((value: boolean | null) => {
      ariaDisabled.set(value);
    });

    const setTabIndex = signalMethod((value: number | null) => {
      tabIndex.set(value);
    });

    const newState: NgpActionableState = {
      disabled: disabled.asReadonly(),
      focusableWhenDisabled: focusable.asReadonly(),
      ariaDisabled: ariaDisabled.asReadonly(),
      tabIndex: tabIndex.asReadonly(),
      setDisabled,
      setFocusableWhenDisabled,
      setAriaDisabled,
      setTabIndex,
    };

    actionableStateMap.set(element, newState);
    return newState;
  });
}
