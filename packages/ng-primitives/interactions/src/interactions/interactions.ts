import { computed, isSignal, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpFocusVisible } from '../focus-visible/focus-visible-interaction';
import { ngpFocus } from '../focus/focus-interaction';
import { ngpHover } from '../hover/hover-interaction';
import { ngpPress } from '../press/press-interaction';

export interface NgpInteractionOptions {
  hover?: boolean | Signal<boolean>;
  press?: boolean | Signal<boolean>;
  focus?: boolean | Signal<boolean>;
  focusWithin?: boolean;
  focusVisible?: boolean | Signal<boolean>;
  disabled?: Signal<boolean>;
}

/**
 * Setup the interactions without relying on HostDirectives.
 * @internal
 */
export function ngpInteractions({
  focus,
  hover,
  press,
  focusWithin,
  focusVisible,
  disabled = signal(false),
}: NgpInteractionOptions): void {
  const elementRef = injectElementRef();
  // If the interaction has already been setup, we can skip the setup.
  if (hasInteraction(elementRef.nativeElement, 'interactions')) {
    return;
  }

  if (hover) {
    ngpHover({ disabled: isSignal(hover) ? computed(() => !hover() || disabled()) : disabled });
  }
  if (press) {
    ngpPress({ disabled: isSignal(press) ? computed(() => !press() || disabled()) : disabled });
  }
  if (focus) {
    ngpFocus({
      focusWithin,
      disabled: isSignal(focus) ? computed(() => !focus() || disabled()) : disabled,
    });
  }
  if (focusVisible) {
    ngpFocusVisible({
      disabled: isSignal(focusVisible) ? computed(() => !focusVisible() || disabled()) : disabled,
    });
  }
}

/**
 * This function checks to see if a given interaction has already been setup on a given element.
 * If it has, it returns the existing interaction state.
 * If it has not, it sets up the interaction state for future checks.
 */
export function hasInteraction(element: HTMLElement, interaction: string): boolean {
  const hasInteraction = `__ngp-${interaction}` in element;

  // if the interaction has not been setup, we mark it as setup for future checks
  if (!hasInteraction) {
    (element as unknown as Record<string, unknown>)[`__ngp-${interaction}`] = true;
  }

  return hasInteraction;
}
