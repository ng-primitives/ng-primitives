import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  computed,
  DestroyRef,
  inject,
  PLATFORM_ID,
  signal,
  Signal,
} from '@angular/core';
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
 * The state interface for soft disabled behavior. Provides read-only access
 * to current state values and methods to programmatically update them.
 */
export interface NgpSoftDisabledState {
  /**
   * Whether the element is currently soft disabled. When `true`, most interactions
   * are blocked while the element can optionally remain focusable.
   */
  readonly softDisabled: Signal<boolean>;

  /**
   * Whether the element remains focusable when soft disabled. When `true`,
   * the element stays in the tab order but blocks clicks and most keypresses.
   */
  readonly focusable: Signal<boolean>;

  /**
   * The current tab index value. This reflects the base value before any
   * adjustments made by the soft disabled state.
   */
  readonly tabIndex: Signal<number>;

  /**
   * The current aria-disabled base value. The actual DOM attribute may differ
   * based on the soft disabled state (forced to `true` when soft disabled).
   */
  readonly ariaDisabled: Signal<boolean>;

  /**
   * Programmatically set the soft disabled state.
   * @param value Whether the element should be soft disabled.
   */
  setSoftDisabled(value: boolean): void;

  /**
   * Programmatically set whether the element is focusable when soft disabled.
   * @param value Whether the element should remain focusable.
   */
  setFocusable(value: boolean): void;

  /**
   * Programmatically set the tab index. This value may be adjusted when
   * soft disabled based on the focusable setting.
   * @param value The tab index value.
   */
  setTabIndex(value: number): void;

  /**
   * Programmatically set the aria-disabled value. When `true`, sets
   * `aria-disabled="true"`. When `false`, removes the attribute.
   * @param value The aria-disabled value.
   */
  setAriaDisabled(value: boolean): void;
}

/**
 * Configuration props for the soft disabled primitive.
 */
export interface NgpSoftDisabledProps {
  /**
   * Whether the element is soft disabled. When `true`, the element appears
   * disabled and blocks most interactions while optionally remaining focusable.
   * @default false
   */
  readonly softDisabled?: Signal<boolean>;

  /**
   * Whether the element should remain focusable when soft disabled.
   * When `true`, the element stays in the tab order but blocks other interactions.
   * @default true
   */
  readonly focusable?: Signal<boolean>;

  /**
   * The tab index of the element.
   * If not provided, initializes from the element's current `tabIndex` property.
   *
   * When soft disabled:
   * - If focusable: negative values are adjusted to `0`
   * - If not focusable: positive values are adjusted to `-1`
   *
   * @default Value from the element's current `tabIndex` property
   */
  readonly tabIndex?: number | Signal<number>;

  /**
   * The aria-disabled attribute value.
   * If not provided, initializes from the element's current `ariaDisabled` property.
   *
   * This value is automatically overridden:
   * - When soft disabled: forced to `true`
   * - When natively disabled: forced to `false` (attribute removed)
   *
   * @default Value from the element's current `ariaDisabled` property
   */
  readonly ariaDisabled?: boolean | Signal<boolean>;
}

export const [
  NgpSoftDisabledStateToken,
  ngpSoftDisabled,
  injectSoftDisabledState,
  provideSoftDisabledState,
] = createPrimitive(
  'NgpSoftDisabled',
  ({
    softDisabled: _softDisabled = signal(false),
    focusable: _focusable = signal(true),
    tabIndex: _tabIndex = injectElementRef().nativeElement.tabIndex,
    ariaDisabled: _ariaDisabled = booleanAttribute(injectElementRef().nativeElement.ariaDisabled),
  }: NgpSoftDisabledProps): NgpSoftDisabledState => {
    const element = injectElementRef();
    const hasNativeDisable = supportsNativeDisable(element);

    const softDisabled = controlled(_softDisabled);
    const focusable = controlled(_focusable);
    const tabIndex = controlled(_tabIndex);
    const ariaDisabled = controlled(_ariaDisabled);

    isomorphicEffect({
      write: () => {
        setDataAttribute(element, 'data-soft-disabled', softDisabled());
      },
    });

    isomorphicEffect({
      write: () => {
        setDataAttribute(element, 'data-soft-disabled-focusable', focusable());
      },
    });

    // Track native disabled state to avoid conflicts. When an element has native `disabled`,
    // the browser handles accessibility automatically, so we should not add aria-disabled.
    let isNativeDisabled: Signal<boolean>;

    if (hasNativeDisable && isPlatformBrowser(inject(PLATFORM_ID))) {
      // MutationObserver is necessary because the `disabled` property can change externally
      // (e.g., via form controls or other directives) without triggering Angular change detection
      const nativeDisabledSource = signal(element.nativeElement.disabled);
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
            nativeDisabledSource.set(element.nativeElement.disabled);
          }
        });
      });
      observer.observe(element.nativeElement, { attributes: true });
      inject(DestroyRef).onDestroy(() => observer.disconnect());
      isNativeDisabled = computed(() => nativeDisabledSource() || element.nativeElement.disabled);
    } else {
      isNativeDisabled = computed(() => hasNativeDisable && element.nativeElement.disabled);
    }

    // WCAG 2.1.1 requires keyboard operability. We adjust tabindex to control focus:
    // - Focusable disabled elements allow users to discover and understand why an action is unavailable
    // - Non-focusable disabled elements are removed from tab order to streamline navigation
    isomorphicEffect({
      earlyRead: () => {
        let value = tabIndex();

        // Only adjust when soft disabled and not natively disabled (native disabled
        // already removes from tab order, so no adjustment needed)
        if (!isNativeDisabled() && softDisabled()) {
          if (focusable()) {
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
        if (isNativeDisabled()) {
          value = false;
        } else if (softDisabled()) {
          value = true;
        }

        // ARIA best practice: remove attribute when false rather than setting "false"
        return value ? 'true' : null;
      },
      write: value => {
        element.nativeElement.ariaDisabled = value();
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
        if (softDisabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      evtOpts,
    );

    // Block keyboard activation (Enter, Space, etc.) while preserving Tab for navigation.
    // Users must be able to tab away from a focused disabled element.
    listener(
      element,
      'keydown',
      event => {
        if (softDisabled()) {
          if (focusable() && event.key === 'Tab') {
            return;
          }
          event.preventDefault();
          event.stopImmediatePropagation();
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
        if (softDisabled()) {
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
        if (softDisabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      },
      evtOpts,
    );

    return {
      softDisabled: softDisabled.asReadonly(),
      focusable: focusable.asReadonly(),
      tabIndex: tabIndex.asReadonly(),
      ariaDisabled: ariaDisabled.asReadonly(),
      setSoftDisabled: value => softDisabled.set(value),
      setFocusable: value => focusable.set(value),
      setTabIndex: value => tabIndex.set(value),
      setAriaDisabled: value => ariaDisabled.set(value),
    } satisfies NgpSoftDisabledState;
  },
);
