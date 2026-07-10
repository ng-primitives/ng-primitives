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
  styleBinding,
} from 'ng-primitives/state';
import { injectColorAreaState } from '../color-area/color-area-state';

type AreaKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown';

/**
 * Public state surface for the Color Area Thumb primitive.
 */
export interface NgpColorAreaThumbState {
  /** Focus the thumb element. */
  focus(origin?: FocusOrigin): void;
}

/**
 * Inputs for configuring the Color Area Thumb primitive.
 */
export interface NgpColorAreaThumbProps {}

export const [
  NgpColorAreaThumbStateToken,
  ngpColorAreaThumb,
  injectColorAreaThumbState,
  provideColorAreaThumbState,
] = createPrimitive('NgpColorAreaThumb', ({}: NgpColorAreaThumbProps): NgpColorAreaThumbState => {
  const element = injectElementRef<HTMLElement>();
  const area = injectColorAreaState();
  const focusMonitor = inject(FocusMonitor);

  const tabindex = computed(() => (area().disabled() ? -1 : 0));

  // Host bindings. A color area is a 2D control with no single ARIA role, so we expose a
  // slider whose aria-valuetext describes both channels (aria-valuenow tracks the x channel).
  attrBinding(element, 'role', 'slider');
  attrBinding(element, 'aria-label', () => `${area().xChannel()} and ${area().yChannel()}`);
  attrBinding(element, 'aria-valuemin', () => area().xRange().min.toString());
  attrBinding(element, 'aria-valuemax', () => area().xRange().max.toString());
  attrBinding(element, 'aria-valuenow', () => Math.round(area().xValue()).toString());
  attrBinding(
    element,
    'aria-valuetext',
    () =>
      `${area().xChannel()} ${Math.round(area().xValue())}, ${area().yChannel()} ${Math.round(
        area().yValue(),
      )}`,
  );
  attrBinding(element, 'tabindex', () => tabindex().toString());
  dataBinding(element, 'data-disabled', () => area().disabled());
  styleBinding(element, 'inset-inline-start.%', () => area().xPercentage());
  styleBinding(element, 'inset-block-start.%', () => 100 - area().yPercentage());

  ngpInteractions({
    hover: true,
    focusVisible: true,
    press: true,
    disabled: area().disabled,
  });

  area().setThumb(element);
  onDestroy(() => area().setThumb(undefined));

  // Keyboard: arrows move in 2D (x = left/right, y = up/down), shift for a x10 step.
  listener(element, 'keydown', (event: KeyboardEvent) => {
    if (area().disabled()) {
      return;
    }

    const isRTL = getComputedStyle(element.nativeElement).direction === 'rtl';
    const multiplier = event.shiftKey ? 10 : 1;

    switch (event.key as AreaKey) {
      case 'ArrowLeft':
        area().adjustChannel(
          area().xChannel(),
          (isRTL ? 1 : -1) * area().xRange().step * multiplier,
        );
        break;
      case 'ArrowRight':
        area().adjustChannel(
          area().xChannel(),
          (isRTL ? -1 : 1) * area().xRange().step * multiplier,
        );
        break;
      case 'ArrowUp':
        area().adjustChannel(area().yChannel(), area().yRange().step * multiplier);
        break;
      case 'ArrowDown':
        area().adjustChannel(area().yChannel(), -area().yRange().step * multiplier);
        break;
      default:
        return;
    }

    event.preventDefault();
  });

  function focus(origin: FocusOrigin = 'program'): void {
    focusMonitor.focusVia(element, origin, { preventScroll: true });
  }

  return { focus } satisfies NgpColorAreaThumbState;
});
