import { signal, Signal } from '@angular/core';
import { ngpDisable, NgpDisableProps, NgpDisableState } from 'ng-primitives/disable';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, createPrimitive, isomorphicEffect, listener } from 'ng-primitives/state';
import { isButtonElement, isUndefined, isValidLink } from 'ng-primitives/utils';

/** Button state extending disable state with role management. */
export interface NgpButtonState extends NgpDisableState {
  /** The current role (`undefined` when using automatic assignment). */
  readonly role: Signal<string | null | undefined>;

  /** Set the role. Use `null` to remove, `undefined` for auto-assignment. */
  setRole(value: string | null | undefined): void;
}

/** Configuration props for the button primitive. */
export interface NgpButtonProps extends NgpDisableProps {
  /**
   * The ARIA role. Auto-assigned for non-native elements (`role="button"` on divs/spans).
   * Native buttons and anchors with href keep their implicit roles.
   */
  readonly role?: Signal<string | null | undefined>;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive(
    'NgpButton',
    ({
      tabIndex: _tabIndex = signal(0),
      role: _role = signal(undefined),
      ...disableProps
    }: NgpButtonProps): NgpButtonState => {
      const element = injectElementRef();

      // Use returned state to allow button control from disable state
      const disableState = ngpDisable({
        ...disableProps,
        tabIndex: _tabIndex,
      });

      const { disabled, focusableWhenDisabled } = disableState;
      const role = controlled(_role);

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
        ...disableState,
        role: role.asReadonly(),
        setRole: value => role.set(value),
      } satisfies NgpButtonState;
    },
  );
