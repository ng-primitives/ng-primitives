import { isSignal, signal, Signal } from '@angular/core';
import { ngpFocusable } from 'ng-primitives/focusable';
import { injectElementRef } from 'ng-primitives/internal';
import { controlled, createPrimitive, listener } from 'ng-primitives/state';
import { isNativeButton, isomorphicRenderEffect, isString, isValidLink } from 'ng-primitives/utils';
import { injectButtonConfig, NgpButtonConfig } from './button-config';

export interface NgpButtonState {
  /**
   * Whether the button is disabled.
   */
  readonly disabled: Signal<boolean>;

  /**
   * Whether the button should remain focusable when disabled.
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
   * The role attribute state value.
   */
  readonly role: Signal<string | null | undefined>;

  /**
   * The type attribute state value.
   */
  readonly type: Signal<string | null | undefined>;

  /**
   * Set the disabled state of the button.
   * @param value The disabled state.
   */
  setDisabled(value: boolean): void;

  /**
   * Set whether the button should remain focusable when disabled.
   * @param value Whether to keep the button focusable when disabled.
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

  /**
   * Set the role attribute state value.
   * @param value The role attribute value.
   */
  setRole(value: string | null | undefined): void;

  /**
   * Set the type attribute state value.
   * @param value The type attribute value.
   */
  setType(value: string | null | undefined): void;
}

export interface NgpButtonProps {
  /**
   * Whether the button is disabled.
   *
   * When `true`:
   * - Click events are blocked via `preventDefault()` and `stopImmediatePropagation()`
   * - Keyboard interactions are blocked (except Tab when `focusableWhenDisabled` is true)
   * - `data-disabled` attribute is applied for styling
   * - Native `disabled` attribute is set (if button supports it and not focusable when disabled)
   */
  readonly disabled?: Signal<boolean>;

  /**
   * Whether the button should remain focusable when disabled.
   *
   * This is essential for loading states where focus should not be lost.
   * When `true`:
   * - Button stays in the tab order
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
   * The tabindex attribute value to set on the button.
   * @remarks
   * A non-undefined value will override the automatically managed tabindex attribute.
   */
  readonly tabIndex?: number | null | Signal<number | null | undefined>;

  /**
   * The aria-disabled attribute value to set on the button.
   * @remarks
   * A non-undefined value will override the automatically managed aria-disabled attribute.
   */
  readonly ariaDisabled?: boolean | string | null | Signal<boolean | string | null | undefined>;

  /**
   * The role attribute value to set on the button.
   * @remarks
   * A non-undefined value will override the automatically managed role attribute
   * but only if the provided button configuration {@link NgpButtonConfig.autoSetButtonRole} is `true`.
   * The config value default is `false` to maintain backwards compatibility.
   */
  readonly role?: string | null | Signal<string | null | undefined>;

  /**
   * The type attribute value to set on the button.
   * @remarks
   * A non-undefined value will override the automatically managed type attribute
   * but only if the provided button configuration {@link NgpButtonConfig.autoSetButtonType} is `true`.
   * The config value default is `false` to maintain backwards compatibility.
   * This should only be set for native buttons.
   * Native `<button>` elements default to `type="submit"` per the HTML spec,
   * which can cause unintended form submissions. Setting `type="button"` prevents this.
   */
  readonly type?: string | null | Signal<string | null | undefined>;

  /**
   * Override the default configuration for the button.
   */
  readonly config?: Partial<NgpButtonConfig>;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive(
    'NgpButton',
    ({
      disabled: _disabled,
      focusableWhenDisabled: _focusableWhenDisabled,
      tabIndex: _tabIndex,
      ariaDisabled: _ariaDisabled,
      role: _role,
      type: _type,
      config: _config,
    }: NgpButtonProps): NgpButtonState => {
      const element = injectElementRef();
      const isButton = isNativeButton(element);

      const { autoSetButtonRole, autoSetButtonType, autoManageAriaDisabled, autoManageTabIndex } = {
        ...injectButtonConfig(),
        ..._config,
      };

      const {
        disabled,
        focusableWhenDisabled,
        tabIndex,
        ariaDisabled,
        setDisabled,
        setFocusableWhenDisabled,
        setTabIndex,
        setAriaDisabled,
      } = ngpFocusable({
        disabled: _disabled,
        focusableWhenDisabled: _focusableWhenDisabled,
        tabIndex: _tabIndex,
        ariaDisabled: _ariaDisabled,
        config: { autoManageAriaDisabled, autoManageTabIndex },
      });

      const type = controlled(isSignal(_type) ? _type : signal(_type));
      const role = controlled(isSignal(_role) ? _role : signal(_role));

      isomorphicRenderEffect({
        earlyRead: () => {
          if (!autoSetButtonType) {
            return false;
          }

          // Non-native elements don't need to set the type attribute
          if (!isButton) {
            return false;
          }

          // Only set the type attribute if it's not already set
          return !element.nativeElement.hasAttribute('type');
        },
        write: shouldAutoSet => {
          const value = type();
          if (isString(value)) {
            element.nativeElement.setAttribute('type', value);
          } else if (value === null) {
            element.nativeElement.removeAttribute('type');
          } else if (shouldAutoSet()) {
            element.nativeElement.setAttribute('type', 'button');
          }
        },
      });

      isomorphicRenderEffect({
        earlyRead: () => {
          if (!autoSetButtonRole) {
            return false;
          }

          // Native buttons already have an implicit role="button"
          if (isButton) {
            return false;
          }

          // Anchors with href should retain their native "link" role.
          // This needs to be checked after render in case the host
          // has a routerLink which can set the href after render.
          if (isValidLink(element)) {
            return false;
          }

          // Non-native elements need role="button" for screen readers to announce them as buttons
          // But only if the role is not already set
          return !element.nativeElement.hasAttribute('role');
        },
        write: shouldAutoSet => {
          const value = role();
          if (isString(value)) {
            element.nativeElement.setAttribute('role', value);
          } else if (value === null) {
            element.nativeElement.removeAttribute('role');
          } else if (shouldAutoSet()) {
            element.nativeElement.setAttribute('role', 'button');
          }
        },
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
        const shouldClick =
          event.target === event.currentTarget &&
          !isButton &&
          // routerLink only sets href after rendering
          // so always re-check the element's tag for anchor and href
          !isValidLink(element) &&
          !disabled();

        const isEnterKey = event.key === 'Enter';
        const isSpaceKey = event.key === ' ';

        if (shouldClick) {
          if (isSpaceKey || isEnterKey) {
            event.preventDefault();
          }

          // Enter activates immediately on keydown (like native buttons)
          // Space activates on keyup (handled separately) to allow cancellation
          if (isEnterKey) {
            element.nativeElement.click();
          }
        }
      });

      // Space activates on keyup (like native buttons) to allow cancellation.
      // calling preventDefault in keyUp on a <button> will not dispatch a click event if Space is pressed
      // https://codesandbox.io/p/sandbox/button-keyup-preventdefault-dn7f0
      // Keyboard accessibility for non interactive elements
      listener(element, 'keyup', event => {
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

      // Prevent mouse down events when disabled
      listener(element, 'mousedown', event => {
        if (disabled()) {
          event.preventDefault();
        }
      });

      return {
        disabled,
        focusableWhenDisabled,
        tabIndex,
        ariaDisabled,
        role: role.asReadonly(),
        type: type.asReadonly(),
        setDisabled,
        setFocusableWhenDisabled,
        setTabIndex,
        setAriaDisabled,
        setRole: value => role.set(value),
        setType: value => type.set(value),
      } satisfies NgpButtonState;
    },
  );
