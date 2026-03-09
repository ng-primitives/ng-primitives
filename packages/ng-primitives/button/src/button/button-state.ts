/**
 * @fileoverview
 * Core button state management implementing the WAI-ARIA Button Pattern.
 *
 * This module provides the underlying logic for NgpButton, handling:
 * - Disabled state with proper ARIA semantics
 * - Keyboard interaction (Enter/Space activation)
 * - Interaction states (hover, press, focus-visible)
 * - Role assignment for non-native button elements
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/button/ WAI-ARIA Button Pattern}
 */
import { computed } from '@angular/core';
import { ngpInteract, NgpInteractProps, NgpInteractState } from 'ng-primitives/interact';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, isomorphicRender, listener } from 'ng-primitives/state';
import {
  isNativeAnchorTag,
  isNativeButtonTag,
  isNativeInputTag,
  isString,
} from 'ng-primitives/utils';

/**
 * Represents the current state of a button primitive.
 */
export interface NgpButtonState extends NgpInteractState {}

/**
 * Configuration options for creating a button primitive.
 */
export interface NgpButtonProps extends NgpInteractProps {
  /** Initial role attribute value. Automatically assigned if not provided. */
  readonly role?: string;

  /** Initial type attribute value. Only valid if the element supports the type attribute. */
  readonly type?: string;
}

export const [NgpButtonStateToken, ngpButton, injectButtonState, provideButtonState] =
  createPrimitive(
    'NgpButton',
    ({ role, type, ...disableProps }: NgpButtonProps): NgpButtonState => {
      const element = injectElementRef();

      // Delegate disabled state management to the interact primitive.
      // This handles: disabled/aria-disabled attributes, tabindex adjustment, and keyboard blocking.
      const disableState = ngpInteract(disableProps);
      const { disabled, focusableWhenDisabled } = disableState;

      // Setup interaction states via data attributes (data-hover, data-press, data-focus-visible).
      // These are disabled when the button is disabled, except focus-visible which respects
      // focusableWhenDisabled to allow focus rings on focusable disabled buttons.
      const enabled = computed(() => !disabled());
      ngpInteractions({
        hover: enabled,
        press: enabled,
        focusVisible: computed(() => enabled() || focusableWhenDisabled()),
      });

      // Assign role="button" to non-native elements for screen reader announcements.
      // Native <button>, <input type="button|submit|reset">, and <a href> elements
      // have implicit roles and don't need explicit assignment.
      if (isString(role)) {
        element.nativeElement.setAttribute('role', role);
      } else {
        isomorphicRender({
          earlyRead: () => {
            if (element.nativeElement.hasAttribute('role')) {
              return false;
            }

            // Skip elements with implicit button role
            if (
              isNativeButtonTag(element) ||
              isNativeInputTag(element, { types: ['button', 'submit', 'reset', 'image'] })
            ) {
              return false;
            }

            // Skip anchors with href (implicit link role)
            if (isNativeAnchorTag(element, { validLink: true })) {
              return false;
            }

            return true;
          },
          write: setButtonRole => {
            if (setButtonRole) {
              element.nativeElement.setAttribute('role', 'button');
            }
          },
        });
      }

      if (isString(type) && 'type' in element.nativeElement) {
        element.nativeElement.type = type;
      }

      // Block all click events when disabled, including those bubbled from children.
      // A disabled button is fully non-interactive.
      listener(element, 'click', event => {
        if (disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      // Block mousedown separately for browsers/environments where pointerdown
      // may not fully prevent mouse-specific behaviors.
      listener(element, 'mousedown', event => {
        if (disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      // Keyboard activation per WAI-ARIA Button Pattern:
      // - Enter: Activates immediately on keydown
      // - Space: Activates on keyup (allows cancellation by moving focus before releasing)
      // Native buttons handle this automatically; we only add it for non-native elements.
      // Anchors with href are excluded as browsers handle their keyboard behavior.
      listener(element, 'keydown', event => {
        // Note: stop immediate propagation handled by the interact primitive.

        const shouldClick =
          event.target === event.currentTarget &&
          !isNativeButtonTag(element) &&
          !isNativeInputTag(element, { types: ['button', 'submit', 'reset', 'image'] }) &&
          !isNativeAnchorTag(element, { validLink: true }) &&
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

      // Space key activates on keyup to match native button behavior
      listener(element, 'keyup', event => {
        if (disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
          return;
        }

        if (
          event.target === event.currentTarget &&
          !isNativeButtonTag(element) &&
          !isNativeInputTag(element, { types: ['button', 'submit', 'reset', 'image'] }) &&
          !isNativeAnchorTag(element, { validLink: true }) &&
          event.key === ' '
        ) {
          element.nativeElement.click();
        }
      });

      // Block pointerdown to prevent text selection and drag operations
      listener(element, 'pointerdown', event => {
        if (disabled()) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      return { ...disableState } satisfies NgpButtonState;
    },
  );
