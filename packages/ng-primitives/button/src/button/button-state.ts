import { signal, Signal } from '@angular/core';
import { ngpDisable } from 'ng-primitives/disable';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, createPrimitive, isomorphicEffect, listener } from 'ng-primitives/state';
import {
  isNativeAnchorTag,
  isNativeButtonTag,
  isNativeInputTag,
  isString,
  isUndefined,
} from 'ng-primitives/utils';

/** Button state extending disable state with role management. */
export interface NgpButtonState {
  /** Whether the element is disabled. */
  readonly disabled: Signal<boolean>;

  /** Whether the element remains focusable when disabled. */
  readonly focusableWhenDisabled: Signal<boolean>;

  /** The current tab index value (before any disabled-state adjustments). */
  readonly tabIndex: Signal<number>;

  /** The current role (`undefined` when using automatic assignment). */
  readonly role: Signal<string | null | undefined>;

  /** Set the disabled state. */
  setDisabled(value: boolean): void;

  /** Set whether the element is focusable when disabled. */
  setFocusableWhenDisabled(value: boolean): void;

  /** Set the tab index. */
  setTabIndex(value: number): void;

  /** Set the role. Use `null` to remove, `undefined` for auto-assignment. */
  setRole(value: string | null | undefined): void;
}

/** Configuration props for the button primitive. */
export interface NgpButtonProps {
  /**
   * Whether the element is disabled.
   * @default false
   */
  readonly disabled?: Signal<boolean>;

  /**
   * Whether the element remains focusable when disabled (stays in tab order).
   * @default false
   */
  readonly focusableWhenDisabled?: Signal<boolean>;

  /**
   * The tab index. Adjusted when disabled based on `focusableWhenDisabled`.
   * @default 0
   */
  readonly tabIndex?: Signal<number>;

  /**
   * The ARIA role. Auto-assigned for non-native elements (`role="button"` on divs/spans).
   * Native buttons and anchors with href keep their implicit roles.
   * @default undefined
   */
  readonly role?: Signal<string | null | undefined>;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive(
    'NgpButton',
    ({
      disabled: _disabled = signal(false),
      focusableWhenDisabled: _focusableWhenDisabled = signal(false),
      tabIndex: _tabIndex = signal(0),
      role: _role = signal(undefined),
    }: NgpButtonProps): NgpButtonState => {
      const element = injectElementRef();

      const disabled = controlled(_disabled);
      const focusableWhenDisabled = controlled(_focusableWhenDisabled);
      const tabIndex = controlled(_tabIndex);
      const role = controlled(_role);

      ngpDisable({ disabled, focusableWhenDisabled, tabIndex });

      ngpInteractions({
        hover: true,
        press: true,
        focusVisible: true,
        disabled,
        focusableWhenDisabled,
      });

      // Screen readers need an explicit role to announce non-native elements as buttons.
      // We use isomorphicEffect because routerLink sets href asynchronously, and we need
      // to check the final DOM state to avoid incorrectly adding role="button" to links.
      isomorphicEffect({
        earlyRead: () => {
          const value = role();
          console.log(value);

          // Explicit role takes precedence (including null to remove)
          if (!isUndefined(value)) {
            return value;
          }

          // Native <button> and <input type="button|submit|reset"> have implicit button role
          // Anchors with href have implicit link role; adding button role would be incorrect
          if (
            isNativeButtonTag(element) ||
            isNativeInputTag(element, 'button', 'submit', 'reset') ||
            isNativeAnchorTag(element, true)
          ) {
            return undefined;
          }

          // Non-native elements (div, span, etc.) need explicit role for accessibility
          return 'button';
        },
        write: _value => {
          const value = _value();
          if (isString(value)) {
            element.nativeElement.setAttribute('role', value);
          } else if (value === null) {
            element.nativeElement.removeAttribute('role');
          }
        },
      });

      // WCAG 2.1.1 requires keyboard operability. Native buttons respond to Enter/Space
      // automatically, but divs, spans, and anchors without href do not.
      listener(element, 'keydown', event => {
        // Only handle direct events (not bubbled from children) on non-native elements
        const shouldClick =
          event.target === event.currentTarget &&
          !isNativeButtonTag(element) &&
          !isNativeAnchorTag(element, true) && // Re-check at runtime; routerLink may have added href
          !disabled();

        const isSpaceKey = event.key === ' ';
        const isEnterKey = event.key === 'Enter';

        if (shouldClick) {
          // Prevent default to stop Space from scrolling the page
          if (isSpaceKey || isEnterKey) {
            event.preventDefault();
          }

          // Native button behavior: Enter fires immediately, Space waits for keyup
          // (allowing users to cancel by moving focus before releasing)
          if (isEnterKey) {
            element.nativeElement.click();
          }
        }
      });

      // Space activation on keyup matches native button behavior and allows cancellation.
      // Note: We cannot use keyup for native buttons because calling preventDefault
      // in keyup suppresses the click event. See: https://codesandbox.io/p/sandbox/button-keyup-preventdefault-dn7f0
      listener(element, 'keyup', event => {
        if (
          event.target === event.currentTarget &&
          !isNativeButtonTag(element) &&
          !isNativeAnchorTag(element, true) &&
          !disabled() &&
          event.key === ' '
        ) {
          element.nativeElement.click();
        }
      });

      return {
        disabled: disabled.asReadonly(),
        focusableWhenDisabled: focusableWhenDisabled.asReadonly(),
        tabIndex: tabIndex.asReadonly(),
        role: role.asReadonly(),
        setDisabled: value => disabled.set(value),
        setFocusableWhenDisabled: value => focusableWhenDisabled.set(value),
        setTabIndex: value => tabIndex.set(value),
        setRole: value => role.set(value),
      } satisfies NgpButtonState;
    },
  );
