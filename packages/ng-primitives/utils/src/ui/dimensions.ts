/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
  AfterRenderPhase,
  ElementRef,
  Renderer2,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

/**
 * Injects the dimensions of the element
 * @returns The dimensions of the element
 */
export function injectDimensions() {
  const renderer = inject(Renderer2);
  const element = inject<ElementRef<HTMLElement>>(ElementRef);
  const size = signal<{ width: number; height: number; mounted: boolean }>({
    width: 0,
    height: 0,
    mounted: false,
  });
  let transitionDuration: string | undefined, animationName: string | undefined;

  afterNextRender(
    () => {
      transitionDuration = element.nativeElement.style.transitionDuration;
      animationName = element.nativeElement.style.animationName;
    },
    { phase: AfterRenderPhase.EarlyRead },
  );

  afterNextRender(
    () => {
      // block any animations/transitions so the element renders at its full dimensions
      renderer.setStyle(element.nativeElement, 'transitionDuration', '0s');
      renderer.setStyle(element.nativeElement, 'animationName', 'none');
    },
    { phase: AfterRenderPhase.Write },
  );

  afterNextRender(
    () => {
      const { width, height } = element.nativeElement.getBoundingClientRect();
      size.set({ width, height, mounted: true });

      // restore the original transition duration and animation name
      renderer.setStyle(element.nativeElement, 'transitionDuration', transitionDuration);
      renderer.setStyle(element.nativeElement, 'animationName', animationName);
    },
    { phase: AfterRenderPhase.Read },
  );

  return size;
}
