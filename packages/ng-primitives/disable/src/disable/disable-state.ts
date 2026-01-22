import { booleanAttribute, signal, Signal } from '@angular/core';
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

  /** The base aria-disabled value (may be overridden when disabled). */
  readonly ariaDisabled: Signal<boolean>;

  /** Set the disabled state. */
  setDisabled(value: boolean): void;

  /** Set whether the element is focusable when disabled. */
  setFocusableWhenDisabled(value: boolean): void;

  /** Set the tab index. */
  setTabIndex(value: number): void;

  /** Set the aria-disabled value. */
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
   * Whether the element remains focusable when disabled (stays in tab order).
   * @default false
   */
  readonly focusableWhenDisabled?: Signal<boolean>;

  /**
   * The tab index. Adjusted when disabled based on `focusableWhenDisabled`.
   * @default Element's current tabIndex
   */
  readonly tabIndex?: number | Signal<number>;

  /**
   * The aria-disabled value. Forced to `true` when disabled on non-native elements.
   * @default Element's current ariaDisabled
   */
  readonly ariaDisabled?: boolean | Signal<boolean>;
}

export const [NgpDisableStateToken, ngpDisable, injectDisableState, provideDisableState] =
  createPrimitive(
    'NgpDisable',
    ({
      disabled: _disabled = signal(false),
      focusableWhenDisabled: _focusableWhenDisabled = signal(false),
      tabIndex: _tabIndex = injectElementRef().nativeElement.tabIndex,
      ariaDisabled: _ariaDisabled = booleanAttribute(injectElementRef().nativeElement.ariaDisabled),
    }: NgpDisableProps): NgpDisableState => {
      const element = injectElementRef();
      const hasNativeDisable = supportsNativeDisable(element);

      const disabled = controlled(_disabled);
      const focusableWhenDisabled = controlled(_focusableWhenDisabled);
      const tabIndex = controlled(_tabIndex);
      const ariaDisabled = controlled(_ariaDisabled);

      isomorphicEffect({
        write: () => {
          setDataAttribute(element, 'data-disabled', disabled());
        },
      });

      isomorphicEffect({
        earlyRead: () => disabled() && focusableWhenDisabled(),
        write: value => {
          setDataAttribute(element, 'data-focusable-disabled', value());
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

          // Only adjust for non-native elements (native disabled already removes from tab order)
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
          let value = ariaDisabled();

          // Native disabled already communicates state to AT; adding aria-disabled would be redundant
          if (hasNativeDisable) {
            value = false;
          } else if (disabled()) {
            value = true;
          }

          return value;
        },
        write: value => {
          // ARIA best practice: remove attribute when false rather than setting "false"
          element.nativeElement.ariaDisabled = value() ? 'true' : null;
        },
      });

      // Capture phase listeners intercept events before they reach other handlers,
      // ensuring disabled elements truly block all interactions regardless of
      // what other event listeners may be attached
      const evtOpts = { config: { capture: true } satisfies AddEventListenerOptions };

      // Block click to prevent form submissions, navigation, and other actions
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
        ariaDisabled: ariaDisabled.asReadonly(),
        setDisabled: value => disabled.set(value),
        setFocusableWhenDisabled: value => focusableWhenDisabled.set(value),
        setTabIndex: value => tabIndex.set(value),
        setAriaDisabled: value => ariaDisabled.set(value),
      } satisfies NgpDisableState;
    },
  );
