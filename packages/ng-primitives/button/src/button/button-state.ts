import { afterRenderEffect, computed, signal, Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  controlled,
  createPrimitive,
  isomorphicEffect,
  listener,
  setDataAttribute,
} from 'ng-primitives/state';
import {
  isButtonElement,
  isUndefined,
  isValidLink,
  supportsNativeDisable,
} from 'ng-primitives/utils';

/**
 * The state interface for button behavior. Provides read-only access to
 * current state values and methods to programmatically update them.
 */
export interface NgpButtonState {
  /**
   * Whether the button is disabled. When `true`, the button does not respond
   * to user interactions and is styled with `data-disabled`.
   */
  readonly disabled: Signal<boolean>;

  /**
   * The current role of the button. Returns `null` if no explicit role is set
   * and automatic assignment is being used.
   *
   * For non-native elements without an explicit role, `role="button"` is
   * automatically applied to the DOM element.
   */
  readonly role: Signal<string | null>;

  /**
   * Programmatically set the disabled state.
   * @param value Whether the button should be disabled.
   */
  setDisabled(value: boolean): void;

  /**
   * Programmatically set the role.
   * @param value The role value, `null` to remove, or `undefined` for automatic assignment.
   */
  setRole(value: string | null | undefined): void;
}

/**
 * Configuration props for the button primitive.
 */
export interface NgpButtonProps {
  /**
   * Whether the button is disabled. When `true`:
   * - Native buttons get the `disabled` attribute
   * - All elements get `data-disabled` for styling
   * - Click events are blocked
   * - Interaction states are suppressed
   * @default false
   */
  readonly disabled?: Signal<boolean>;

  /**
   * The ARIA role of the button.
   * If not provided, initializes from the element's current `role` property.
   *
   * Automatic role assignment (when `undefined`):
   * - Native buttons: no explicit role (uses implicit `button` role)
   * - Anchors with `href`: no explicit role (preserves native `link` role)
   * - Other elements: `role="button"` is applied
   *
   * Setting to `null` explicitly removes the role.
   *
   * @default Value from the element's current `role` property, or `undefined` for automatic assignment
   */
  readonly role?: string | null | Signal<string | null | undefined>;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive(
    'NgpButton',
    ({
      disabled: _disabled = signal(false),
      role: _role = injectElementRef().nativeElement.getAttribute('role') ?? undefined,
    }: NgpButtonProps): NgpButtonState => {
      const element = injectElementRef();

      const disabled = controlled(_disabled);
      const role = controlled(_role);

      ngpInteractions({ hover: true, press: true, focusVisible: true, disabled });

      isomorphicEffect({
        write: () => {
          setDataAttribute(element, 'data-disabled', disabled());
        },
      });

      // Only native form elements (<button>, <input>) support the disabled attribute.
      // Non-native elements rely on aria-disabled and event blocking instead.
      if (supportsNativeDisable(element)) {
        isomorphicEffect({
          write: () => {
            element.nativeElement.disabled = disabled();
          },
        });
      }

      // Screen readers need an explicit role to announce non-native elements as buttons.
      // We use afterRenderEffect because routerLink sets href asynchronously, and we need
      // to check the final DOM state to avoid incorrectly adding role="button" to links.
      afterRenderEffect({
        earlyRead: () => {
          const value = role();

          // Explicit role takes precedence (including null to remove)
          if (!isUndefined(value)) {
            return value;
          }

          // Native <button> and <input type="button|submit|reset"> have implicit button role
          if (isButtonElement(element)) {
            return undefined;
          }

          // Anchors with href have implicit link role; adding button role would be incorrect
          if (isValidLink(element)) {
            return undefined;
          }

          // Non-native elements (div, span, etc.) need explicit role for accessibility
          return 'button';
        },
        write: _value => {
          const value = _value();

          // Only set when defined; undefined means keep current state (native elements)
          if (value === undefined) {
            return;
          }

          if (value === null) {
            element.nativeElement.removeAttribute('role');
          } else {
            element.nativeElement.setAttribute('role', value);
          }
        },
      });

      // Disabled buttons must not trigger actions. Native disabled buttons already
      // block events, but we need this for non-native elements and as a safety net.
      listener(element, 'click', event => {
        if (disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      // WCAG 2.1.1 requires keyboard operability. Native buttons respond to Enter/Space
      // automatically, but divs, spans, and anchors without href do not.
      listener(element, 'keydown', event => {
        // Only handle direct events (not bubbled from children) on non-native elements
        const shouldClick =
          event.target === event.currentTarget &&
          !isButtonElement(element) &&
          !isValidLink(element) && // Re-check at runtime; routerLink may have added href
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
          !isButtonElement(element) &&
          !isValidLink(element) &&
          !disabled() &&
          event.key === ' '
        ) {
          element.nativeElement.click();
        }
      });

      return {
        disabled: disabled.asReadonly(),
        role: computed(() => role() ?? null),
        setDisabled: disabled.set,
        setRole: role.set,
      } satisfies NgpButtonState;
    },
  );
