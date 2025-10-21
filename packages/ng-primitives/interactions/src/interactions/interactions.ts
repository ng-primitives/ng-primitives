import { ElementRef, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpFocusVisibleInteraction } from '../focus-visible/focus-visible-interaction';
import { ngpFocusInteraction } from '../focus/focus-interaction';
import { ngpHoverInteraction } from '../hover/hover-interaction';
import { ngpPressInteraction } from '../press/press-interaction';

export interface NgpInteractionOptions {
  hover?: boolean;
  press?: boolean;
  focus?: boolean;
  focusWithin?: boolean;
  focusVisible?: boolean;
  disabled?: Signal<boolean>;
  element?: ElementRef<HTMLElement>;
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
  element = injectElementRef(),
}: NgpInteractionOptions): void {
  // If the interaction has already been setup, we can skip the setup.
  if (hasInteraction(element.nativeElement, 'interactions')) {
    return;
  }

  if (hover) {
    ngpHoverInteraction({ element, disabled });
  }
  if (press) {
    ngpPressInteraction({ element, disabled });
  }
  if (focus) {
    ngpFocusInteraction({ element, focusWithin, disabled });
  }
  if (focusVisible) {
    ngpFocusVisibleInteraction({ element, disabled });
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
