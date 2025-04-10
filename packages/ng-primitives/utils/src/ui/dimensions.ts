import { ElementRef, Renderer2, afterNextRender, inject, signal } from '@angular/core';

/**
 * Injects the dimensions of the element
 * @returns The dimensions of the element
 */
export function injectDimensions() {
  const renderer = inject(Renderer2);
  const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const size = signal<{ width: number; height: number; mounted: boolean }>({
    width: 0,
    height: 0,
    mounted: false,
  });
  let transitionDuration: string | undefined, animationName: string | undefined;

  afterNextRender({
    earlyRead: () => {
      transitionDuration = element.style.transitionDuration;
      animationName = element.style.animationName;
    },
    write: () => {
      // block any animations/transitions so the element renders at its full dimensions
      renderer.setStyle(element, 'transitionDuration', '0s');
      renderer.setStyle(element, 'animationName', 'none');
    },
    read: () => {
      const { width, height } = element.getBoundingClientRect();
      size.set({ width, height, mounted: true });
      // restore the original transition duration and animation name
      renderer.setStyle(element, 'transitionDuration', transitionDuration);
      renderer.setStyle(element, 'animationName', animationName);
    },
  });

  return size;
}
