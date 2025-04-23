import { Directive, inject, OnDestroy, Renderer2 } from '@angular/core';
import { injectElementRef } from '../utilities/element-ref';
import { injectExitAnimationManager } from './exit-animation-manager';

@Directive({
  selector: '[ngpExitAnimation]',
  exportAs: 'ngpExitAnimation',
})
export class NgpExitAnimation implements OnDestroy {
  /** The animation manager. */
  private readonly animationManager = injectExitAnimationManager();
  /** The element to animate. */
  private readonly elementRef = injectElementRef();
  /** Access the renderer. */
  private readonly renderer = inject(Renderer2);

  constructor() {
    this.animationManager.add(this);
    this.setAnimationState('enter');
  }

  ngOnDestroy(): void {
    this.animationManager.remove(this);
  }

  /** Mark the element as exiting. */
  exit(): Promise<void> {
    // Capture the initial animation name before changing state
    const initialStyle = window.getComputedStyle(this.elementRef.nativeElement);
    const initialAnimationName = initialStyle.animationName;
    const initialTransitionProperty = initialStyle.transitionProperty;

    this.setAnimationState('exit');

    return new Promise(resolve => {
      // check if there are any exit animations or transitions
      const computedStyle = window.getComputedStyle(this.elementRef.nativeElement);
      const hasTransition = parseFloat(computedStyle.transitionDuration) > 0;
      const hasAnimation = parseFloat(computedStyle.animationDuration) > 0;

      // Compare animation properties to see if they've changed
      const animationChanged =
        computedStyle.animationName !== initialAnimationName &&
        computedStyle.animationName !== 'none';
      const transitionChanged =
        computedStyle.transitionProperty !== initialTransitionProperty &&
        computedStyle.transitionProperty !== 'none';

      // If no new animations/transitions, resolve immediately
      if ((!hasTransition && !hasAnimation) || (!animationChanged && !transitionChanged)) {
        resolve();
        return;
      }

      // wait for the exit animation to finish
      const done = (event: AnimationEvent | TransitionEvent) => {
        // check if the event is for this element
        if (event.target !== this.elementRef.nativeElement) {
          return;
        }

        this.elementRef.nativeElement.removeEventListener('transitionend', done);
        this.elementRef.nativeElement.removeEventListener('animationend', done);

        // reset the animation state
        this.setAnimationState(null);

        resolve();
      };

      this.elementRef.nativeElement.addEventListener('transitionend', done);
      this.elementRef.nativeElement.addEventListener('animationend', done);
    });
  }

  private setAnimationState(state: 'enter' | 'exit' | null): void {
    // remove all current animation state attributes
    this.renderer.removeAttribute(this.elementRef.nativeElement, 'data-enter');
    this.renderer.removeAttribute(this.elementRef.nativeElement, 'data-exit');

    // add the new animation state attribute
    if (state === 'enter') {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'data-enter', '');
    } else if (state === 'exit') {
      this.renderer.setAttribute(this.elementRef.nativeElement, 'data-exit', '');
    }
  }
}
