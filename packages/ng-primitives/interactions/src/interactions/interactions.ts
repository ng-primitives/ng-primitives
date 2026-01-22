import { computed, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpFocusVisible } from '../focus-visible/focus-visible-interaction';
import { ngpFocus } from '../focus/focus-interaction';
import { ngpHover } from '../hover/hover-interaction';
import { ngpPress } from '../press/press-interaction';

export interface NgpInteractionOptions {
  hover?: boolean;
  press?: boolean;
  focus?: boolean;
  focusWithin?: boolean;
  focusVisible?: boolean;
  disabled?: Signal<boolean>;
  focusableWhenDisabled?: Signal<boolean>;
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
  focusableWhenDisabled = signal(false),
}: NgpInteractionOptions): void {
  const elementRef = injectElementRef();
  // If the interaction has already been setup, we can skip the setup.
  if (hasInteraction(elementRef.nativeElement, 'interactions')) {
    return;
  }

  const focusable = computed(() => disabled() && !focusableWhenDisabled());

  if (hover) {
    ngpHover({ disabled });
  }
  if (press) {
    ngpPress({ disabled });
  }
  if (focus) {
    ngpFocus({ focusWithin, disabled: focusable });
  }
  if (focusVisible) {
    ngpFocusVisible({ disabled: focusable });
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
