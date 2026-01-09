import { signal, Signal } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  listener,
} from 'ng-primitives/state';

export interface NgpButtonState {
  /**
   * Whether the button is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * Whether the button should be focusable when disabled.
   *
   * @remarks
   * For buttons that enter a loading state after being clicked, set to
   * true to ensure focus remains on the button when it becomes disabled.
   * This prevents focus from being lost and maintains the tab order.
   */
  readonly focusableWhenDisabled: Signal<boolean>;

  /**
   * The `aria-disabled` attribute value of the button.
   */
  readonly ariaDisabled: Signal<boolean | null>;

  /**
   * The tab index of the button.
   */
  readonly tabIndex: Signal<number | null>;

  /**
   * Set the disabled state of the button.
   * @param value The disabled state.
   */
  setDisabled(value: boolean): void;

  /**
   * Set the focusable when disabled state of the button.
   * @param value The focusable when disabled state.
   */
  setFocusableWhenDisabled(value: boolean): void;

  /**
   * Set the aria-disabled state of the button.
   * @param value The aria-disabled state.
   */
  setAriaDisabled(value: boolean | null): void;

  /**
   * Set the tab index of the button.
   * @param value The tab index.
   */
  setTabIndex(value: number | null): void;
}

export interface NgpButtonProps {
  /**
   * Whether the button is disabled.
   */
  readonly disabled?: Signal<boolean>;

  /**
   * Whether the button should be focusable when disabled.
   *
   * @remarks
   * For buttons that enter a loading state after being clicked, set to
   * true to ensure focus remains on the button when it becomes disabled.
   * This prevents focus from being lost and maintains the tab order.
   */
  readonly focusableWhenDisabled?: Signal<boolean>;

  /**
   * The `aria-disabled` attribute value of the button.
   */
  readonly ariaDisabled?: Signal<boolean | null>;

  /**
   * The tab index of the button.
   */
  readonly tabIndex?: Signal<number | null>;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive(
    'NgpButton',
    ({
      disabled: _disabled = signal(false),
      focusableWhenDisabled: _focusableWhenDisabled = signal(false),
      ariaDisabled: _ariaDisabled = signal(null),
      tabIndex: _tabIndex = signal(null),
    }: NgpButtonProps): NgpButtonState => {
      const element = injectElementRef();
      const isButton = element.nativeElement.tagName.toLowerCase() === 'button';
      const isAnchor = element.nativeElement.tagName.toLowerCase() === 'a';

      // Wrap in function in case of change to href (routerLink has this behavior)
      const isValidLink = () => isAnchor && element.nativeElement.getAttribute('href');

      const disabled = controlled(_disabled);
      const focusableWhenDisabled = controlled(_focusableWhenDisabled);
      const ariaDisabled = controlled(_ariaDisabled);
      const tabIndex = controlled(_tabIndex);

      // Setup interactions (hover, press, focus-visible)
      ngpInteractions({ hover: true, press: true, focusVisible: true, disabled });

      // Setup host attribute bindings
      dataBinding(element, 'data-disabled', disabled);

      // Add the disabled attribute if it's a button element unless focusableWhenDisabled
      if (isButton) {
        attrBinding(element, 'disabled', () =>
          disabled() && !focusableWhenDisabled() ? '' : null,
        );
      }

      // Native buttons default to type="submit"
      // This is usually undesirable so instead default to type="button"
      if (isButton) {
        const initialType = element.nativeElement.getAttribute('type');
        if (!initialType) {
          attrBinding(element, 'type', () => 'button');
        }
      }

      // Non-native elements need role="button" for screen readers to announce them as buttons
      if (!isButton) {
        const initialRole = element.nativeElement.getAttribute('role');
        if (!initialRole) {
          // Anchors with href should retain their native "link" role.
          // This needs to be checked after render in case the host
          // has a routerLink which can set the href after render.
          attrBinding(element, 'role', () => (isValidLink() ? null : 'button'));
        }
      }

      // tabindex="0" makes non-native elements keyboard focusable (WCAG 2.1.1).
      // tabindex="-1" removes from tab order when disabled.
      attrBinding(element, 'tabindex', () => {
        if (tabIndex() != null) {
          return tabIndex();
        }

        if (isButton) {
          return focusableWhenDisabled() ? 0 : null;
        }

        if (disabled()) {
          return focusableWhenDisabled() ? 0 : -1;
        }

        return 0;
      });

      // aria-disabled communicates disabled state to assistive tech without preventing focus
      attrBinding(element, 'aria-disabled', () => {
        if (ariaDisabled() != null) {
          return ariaDisabled();
        }

        if ((isButton && focusableWhenDisabled()) || (!isButton && disabled())) {
          return disabled();
        }

        return null;
      });

      // Prevent click events when disabled - stopImmediatePropagation ensures
      // user-defined click handlers don't fire on disabled buttons
      listener(element, 'click', event => {
        if (disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      // Non-native elements don't respond to Enter/Space by default
      // WCAG 2.1.1 requires keyboard operability for all interactive elements
      listener(element, 'keydown', event => {
        if (disabled()) {
          // Allow tabbing away from focusableWhenDisabled elements, block everything else
          if (focusableWhenDisabled() && event.key !== 'Tab') {
            event.preventDefault();
          }
          return;
        }

        // Non-native elements need synthetic keyboard activation (WCAG 2.1.1)
        const shouldActivate = event.target === event.currentTarget && !isButton && !isValidLink();
        const isEnterKey = event.key === 'Enter';
        const isSpaceKey = event.key === ' ';

        if (shouldActivate && (isSpaceKey || isEnterKey)) {
          event.preventDefault();

          // Enter activates immediately on keydown (like native buttons)
          // Space activates on keyup (handled separately) to allow cancellation
          if (isEnterKey) {
            element.nativeElement.click();
          }
        }
      });

      // Space activates on keyup (like native buttons) to allow cancellation.
      listener(element, 'keyup', event => {
        // calling preventDefault in keyUp on a <button> will not dispatch a click event if Space is pressed
        // https://codesandbox.io/p/sandbox/button-keyup-preventdefault-dn7f0
        // Keyboard accessibility for non interactive elements
        if (event.target === event.currentTarget && !isButton && !disabled() && event.key === ' ') {
          element.nativeElement.click();
        }
      });

      // Prevent text selection and other default behaviors when clicking disabled buttons
      listener(element, 'pointerdown', event => {
        if (disabled()) {
          event.preventDefault();
        }
      });

      function setDisabled(value: boolean): void {
        disabled.set(value);
      }

      function setFocusableWhenDisabled(value: boolean): void {
        focusableWhenDisabled.set(value);
      }

      function setAriaDisabled(value: boolean | null): void {
        ariaDisabled.set(value);
      }

      function setTabIndex(value: number | null): void {
        tabIndex.set(value);
      }

      return {
        disabled: disabled.asReadonly(),
        focusableWhenDisabled: focusableWhenDisabled.asReadonly(),
        ariaDisabled: ariaDisabled.asReadonly(),
        tabIndex: tabIndex.asReadonly(),
        setDisabled,
        setFocusableWhenDisabled,
        setAriaDisabled,
        setTabIndex,
      } satisfies NgpButtonState;
    },
  );

// Relevant a11y resources:
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role
// https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled
// https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html
// https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role#keyboard_interactions

// focusableWhenDisabled inspired by:
// https://github.com/mui/base-ui/blob/master/packages/react/src/utils/useFocusableWhenDisabled.ts
// https://github.com/mui/base-ui/blob/master/packages/react/src/use-button/useButton.ts
