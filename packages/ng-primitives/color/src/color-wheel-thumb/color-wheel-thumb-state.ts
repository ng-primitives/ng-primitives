import { FocusMonitor, FocusOrigin } from '@angular/cdk/a11y';
import { computed, inject } from '@angular/core';
import { ngpInteractions } from 'ng-primitives/interactions';
import { injectElementRef } from 'ng-primitives/internal';
import {
  attrBinding,
  createPrimitive,
  dataBinding,
  listener,
  onDestroy,
} from 'ng-primitives/state';
import { injectColorWheelState } from '../color-wheel/color-wheel-state';

type WheelKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Home' | 'End';

/**
 * Public state surface for the Color Wheel Thumb primitive.
 */
export interface NgpColorWheelThumbState {
  /** Focus the thumb element. */
  focus(origin?: FocusOrigin): void;
}

/**
 * Inputs for configuring the Color Wheel Thumb primitive.
 */
export interface NgpColorWheelThumbProps {}

export const [
  NgpColorWheelThumbStateToken,
  ngpColorWheelThumb,
  injectColorWheelThumbState,
  provideColorWheelThumbState,
] = createPrimitive(
  'NgpColorWheelThumb',
  ({}: NgpColorWheelThumbProps): NgpColorWheelThumbState => {
    const element = injectElementRef<HTMLElement>();
    const wheel = injectColorWheelState();
    const focusMonitor = inject(FocusMonitor);

    const tabindex = computed(() => (wheel().disabled() ? -1 : 0));

    // Host bindings — the wheel adjusts a single hue value, so it is an ARIA slider.
    attrBinding(element, 'role', 'slider');
    attrBinding(element, 'aria-label', 'Hue');
    attrBinding(element, 'aria-valuemin', '0');
    attrBinding(element, 'aria-valuemax', '360');
    attrBinding(element, 'aria-valuenow', () => Math.round(wheel().hue()).toString());
    attrBinding(element, 'aria-valuetext', () => `${Math.round(wheel().hue())}°`);
    attrBinding(element, 'tabindex', () => tabindex().toString());
    dataBinding(element, 'data-disabled', () => wheel().disabled());

    ngpInteractions({
      hover: true,
      focusVisible: true,
      press: true,
      disabled: wheel().disabled,
    });

    wheel().setThumb(element);
    onDestroy(() => wheel().setThumb(undefined));

    listener(element, 'keydown', (event: KeyboardEvent) => {
      if (wheel().disabled()) {
        return;
      }
      const step = event.shiftKey ? 10 : 1;
      const hue = wheel().hue();

      switch (event.key as WheelKey) {
        case 'ArrowRight':
        case 'ArrowUp':
          wheel().setHue(hue + step);
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          wheel().setHue(hue - step);
          break;
        case 'Home':
          wheel().setHue(0);
          break;
        case 'End':
          wheel().setHue(360);
          break;
        default:
          return;
      }

      event.preventDefault();
    });

    function focus(origin: FocusOrigin = 'program'): void {
      focusMonitor.focusVia(element, origin, { preventScroll: true });
    }

    return { focus } satisfies NgpColorWheelThumbState;
  },
);
