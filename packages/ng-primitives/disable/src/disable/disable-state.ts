import { linkedSignal, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import {
  controlled,
  createPrimitive,
  isomorphicEffect,
  listener,
  setDataAttribute,
} from 'ng-primitives/state';
import { supportsNativeDisable } from 'ng-primitives/utils';

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

  /** Set the disabled state. */
  setDisabled(value: boolean): void;

  /** Set whether the element is focusable when disabled. */
  setFocusableWhenDisabled(value: boolean): void;

  /** Set the tab index. */
  setTabIndex(value: number): void;
}

/**
 * Configuration props for the disable primitive.
 */
export interface NgpDisableProps {
  /** Whether the element is disabled. */
  readonly disabled?: Signal<boolean>;

  /** Whether the element remains focusable when disabled (stays in tab order). */
  readonly focusableWhenDisabled?: Signal<boolean>;

  /** The tab index. Adjusted when disabled based on `focusableWhenDisabled`. */
  readonly tabIndex?: Signal<number>;
}

export const [NgpDisableStateToken, ngpDisable, injectDisableState, provideDisableState] =
  createPrimitive(
    'NgpDisable',
    ({
      disabled: _disabled = signal(false),
      focusableWhenDisabled: _focusableWhenDisabled = signal(false),
      tabIndex: _tabIndex = signal(injectElementRef().nativeElement.tabIndex),
    }: NgpDisableProps): NgpDisableState => {
      const element = injectElementRef();
      const hasNativeDisable = supportsNativeDisable(element);

      const disabled = controlled(_disabled);
      const focusableWhenDisabled = controlled(_focusableWhenDisabled);
      const tabIndex = linkedSignal(_tabIndex);

      isomorphicEffect({
        write: () => {
          setDataAttribute(element, 'data-disabled', disabled());
        },
      });

      isomorphicEffect({
        earlyRead: () => disabled() && focusableWhenDisabled(),
        write: value => {
          setDataAttribute(element, 'data-disabled-focusable', value());
        },
      });

      // Only native form elements (<button>, <input>) support the disabled attribute.
      // Non-native elements rely on aria-disabled and event blocking instead.
      if (hasNativeDisable) {
        isomorphicEffect({
          earlyRead: () => disabled() && !focusableWhenDisabled(),
          write: value => {
            element.nativeElement.disabled = value();
          },
        });
      }

      // WCAG 2.1.1 requires keyboard operability. We adjust tabindex to control focus:
      // - Focusable disabled elements allow users to discover and understand why an action is unavailable
      // - Non-focusable disabled elements are removed from tab order to streamline navigation
      isomorphicEffect({
        earlyRead: () => {
          let value = tabIndex();

          // Only adjust for non-native elements (native disabled already handles tab order)
          if (!hasNativeDisable && disabled()) {
            if (focusableWhenDisabled()) {
              value = Math.max(0, value);
            } else {
              value = Math.min(-1, value);
            }
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
          let value = false;

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

      // Capture phase listeners intercept events before they reach other handlers,
      // ensuring disabled elements truly block all interactions regardless of
      // what other event listeners may be attached
      const evtOpts: { config: AddEventListenerOptions } = { config: { capture: true } };

      // Disabled elements must not trigger actions. Native disabled elements already block events,
      // but we need this for non-native elements and focusable when disabled enabled and as a safety net.
      listener(
        element,
        'click',
        event => {
          if (disabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        },
        evtOpts,
      );

      // Block keyboard activation (Enter, Space, etc.) while preserving Tab for navigation.
      // Users must always be able to tab away from a focused disabled element to avoid focus traps.
      listener(
        element,
        'keydown',
        event => {
          if (disabled()) {
            // Always allow Tab to prevent focus trap, regardless of focusable state
            if (event.key === 'Tab') {
              return;
            }

            // Only block events originating from this element, not bubbled from children
            if (event.target === event.currentTarget) {
              event.preventDefault();
              event.stopImmediatePropagation();
            }
          }
        },
        evtOpts,
      );

      // Block pointerdown to prevent text selection, drag operations, and focus changes
      // that could occur from mouse/touch interactions on disabled elements
      listener(
        element,
        'pointerdown',
        event => {
          if (disabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        },
        evtOpts,
      );

      // Block mousedown separately for browsers/environments where pointerdown
      // may not fully prevent mouse-specific behaviors
      listener(
        element,
        'mousedown',
        event => {
          if (disabled()) {
            event.preventDefault();
            event.stopImmediatePropagation();
          }
        },
        evtOpts,
      );

      return {
        disabled: disabled.asReadonly(),
        focusableWhenDisabled: focusableWhenDisabled.asReadonly(),
        tabIndex: tabIndex.asReadonly(),
        setDisabled: value => disabled.set(value),
        setFocusableWhenDisabled: value => focusableWhenDisabled.set(value),
        setTabIndex: value => tabIndex.set(value),
      } satisfies NgpDisableState;
    },
  );
