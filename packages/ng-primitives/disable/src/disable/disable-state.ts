import { booleanAttribute, computed, numberAttribute, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  controlled,
  createPrimitive,
  dataBinding,
  isomorphicEffect,
  listener,
} from 'ng-primitives/state';
import { supportsDisabledAttribute } from 'ng-primitives/utils';

/**
 * This implementation is inspired by MUI Base UI's useFocusableWhenDisabled hook:
 * https://github.com/mui/base-ui/blob/master/packages/react/src/utils/useFocusableWhenDisabled.ts
 */

/**
 * State interface for disabled behavior with read-only access and programmatic setters.
 */
export interface NgpDisableState {
  /** Whether the element is disabled. */
  readonly disabled: Signal<boolean>;

  /** Whether the element remains focusable when disabled. */
  readonly focusableWhenDisabled: Signal<boolean>;

  /** The current tab index value (before any disabled-state adjustments). */
  readonly tabIndex: Signal<number>;

  /** Whether the element is aria-disabled. */
  readonly ariaDisabled: Signal<boolean>;

  /** Set the disabled state. */
  setDisabled(value: boolean): void;

  /** Set whether the element is focusable when disabled. */
  setFocusableWhenDisabled(value: boolean): void;

  /** Set the tab index. */
  setTabIndex(value: number): void;

  /** Set whether the element is aria-disabled. */
  setAriaDisabled(value: boolean): void;
}

/**
 * Configuration props for the disable primitive.
 */
export interface NgpDisableProps {
  /**
   * Whether the element is disabled.
   * @default false
   */
  readonly disabled?: Signal<boolean>;

  /**
   * Controls the `data-disabled` attribute independently of the `disabled` state.
   * Useful when you want to style an element as disabled without blocking events.
   * When either `disabled` or `dataDisabled` is true, `data-disabled` is set.
   * @default false
   */
  readonly dataDisabled?: Signal<boolean | null>;

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
   * Controls the `aria-disabled` attribute independently.
   * Useful when the disabled state is managed externally (e.g., by a form control).
   * @default false
   */
  readonly ariaDisabled?: Signal<boolean>;
}

export const [NgpDisableStateToken, ngpDisable, injectDisableState, provideDisableState] =
  createPrimitive(
    'NgpDisable',
    ({
      disabled: _disabled,
      dataDisabled: _dataDisabled,
      focusableWhenDisabled: _focusableWhenDisabled,
      tabIndex: _tabIndex,
      ariaDisabled: _ariaDisabled,
    }: NgpDisableProps): NgpDisableState => {
      const element = injectElementRef();
      const hasNativeDisable = supportsDisabledAttribute(element);

      const disabled = controlled(_disabled ?? false);
      const dataDisabled = controlled(_dataDisabled ?? false);
      const focusableWhenDisabled = controlled(_focusableWhenDisabled ?? false);
      const tabIndex = controlled(
        _tabIndex ?? numberAttribute(element.nativeElement.getAttribute('tabindex'), 0),
      );
      const ariaDisabled = controlled(
        _ariaDisabled ?? booleanAttribute(element.nativeElement.getAttribute('aria-disabled')),
      );

      // Always set data-disabled when disabled, regardless of element type
      dataBinding(element, 'data-disabled', () => disabled() || dataDisabled());

      // Additional attribute when focusable-while-disabled (useful for distinct styling)
      dataBinding(element, 'data-disabled-focusable', () => disabled() && focusableWhenDisabled());

      // Only native form elements (<button>, <input>) support the disabled attribute.
      // Non-native elements rely on aria-disabled and event blocking instead.
      if (hasNativeDisable) {
        attrBinding(element, 'disabled', () =>
          disabled() && !focusableWhenDisabled() ? '' : null,
        );
      }

      // WCAG 2.1.1 requires keyboard operability. We adjust tabindex to control focus:
      // - Focusable disabled elements allow users to discover and understand why an action is unavailable
      // - Non-focusable disabled elements are removed from tab order to streamline navigation
      isomorphicEffect({
        earlyRead: () => {
          let value = tabIndex();

          // Only adjust for non-native elements (native disabled already handles tab order)
          if (!hasNativeDisable && disabled()) {
            value = focusableWhenDisabled() ? value : -1;
          }

          return value;
        },
        write: value => {
          element.nativeElement.tabIndex = value();
        },
      });

      // aria-disabled informs assistive technology that the element is non-interactive
      // without removing it from the accessibility tree (unlike native disabled)
      isomorphicEffect({
        earlyRead: () => {
          let value = ariaDisabled();

          // Native disabled already communicates state to AT; adding aria-disabled would be redundant
          if ((hasNativeDisable && focusableWhenDisabled()) || (!hasNativeDisable && disabled())) {
            value = disabled();
          }

          return value;
        },
        write: value => {
          if (value()) {
            element.nativeElement.setAttribute('aria-disabled', 'true');
          } else {
            // ARIA best practice: remove attribute when false rather than setting "false"
            element.nativeElement.removeAttribute('aria-disabled');
          }
        },
      });

      // Disabled elements must not trigger actions. While native disabled blocks events,
      // we need explicit blocking for:
      // - Non-native elements (aria-disabled doesn't block events)
      // - Native elements with focusableWhenDisabled (no native disabled attribute)

      // Block click events from triggering actions.
      // Only block events originating from this element, not bubbled from children.
      // This allows interactive children (like inputs inside a disabled fieldset) to work.
      listener(element, 'click', event => {
        if (disabled() && event.target === event.currentTarget) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      // Block keyboard activation (Enter, Space, etc.) but ALWAYS allow Tab.
      // Allowing Tab prevents focus traps - users must always be able to navigate away.
      listener(element, 'keydown', event => {
        if (disabled()) {
          // Tab must always work to prevent trapping keyboard users
          if (event.key === 'Tab') {
            return;
          }

          // Only block events originating from this element, not bubbled from children.
          // This allows interactive children (like inputs inside a disabled fieldset) to work.
          if (event.target === event.currentTarget) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        }
      });

      // Block keyup events (for Space key activation pattern)
      listener(element, 'keyup', event => {
        if (disabled() && event.target === event.currentTarget) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      // Block pointer events to prevent:
      // - Text selection within the element
      // - Drag operations
      // - Focus changes from clicks
      // Only block events originating from this element, not bubbled from children.
      listener(element, 'pointerdown', event => {
        if (disabled() && event.target === event.currentTarget) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      // Block mousedown separately for browsers/environments where pointerdown
      // may not fully prevent mouse-specific behaviors.
      // Only block events originating from this element, not bubbled from children.
      listener(element, 'mousedown', event => {
        if (disabled() && event.target === event.currentTarget) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      return {
        disabled: disabled.asReadonly(),
        focusableWhenDisabled: focusableWhenDisabled.asReadonly(),
        tabIndex: computed(() => tabIndex() ?? element.nativeElement.tabIndex),
        ariaDisabled: computed(
          () => ariaDisabled() ?? booleanAttribute(element.nativeElement.ariaDisabled),
        ),
        setDisabled: value => disabled.set(value),
        setFocusableWhenDisabled: value => focusableWhenDisabled.set(value),
        setTabIndex: value => tabIndex.set(value),
        setAriaDisabled: value => ariaDisabled.set(value),
      } satisfies NgpDisableState;
    },
  );
