import { ChangeDetectorRef, Directive, inject, OnDestroy, signal } from '@angular/core';
import { injectElementRef } from '../utilities/element-ref';
import { injectExitAnimationManager } from './exit-animation-manager';

@Directive({
  selector: '[ngpExitAnimation]',
  exportAs: 'ngpExitAnimation',
  host: {
    // Deprecated - use data-exit instead
    '[attr.data-closing]': 'animationState() === "exit" ? "" : null',
    '[attr.data-exit]': 'animationState() === "exit" ? "" : null',
  },
})
export class NgpExitAnimation implements OnDestroy {
  /** The animation manager. */
  private readonly animationManager = injectExitAnimationManager();
  /** The element to animate. */
  private readonly element = injectElementRef();
  /** Access the change detector. */
  private readonly changeDetector = inject(ChangeDetectorRef);

  /** The animation state */
  private readonly animationState = signal<'enter' | 'exit'>('enter');

  constructor() {
    this.animationManager.add(this);
  }

  ngOnDestroy(): void {
    this.animationManager.remove(this);
  }

  /** Mark the element as exiting. */
  exit(): Promise<void> {
    // Capture the initial animation name before changing state
    const initialStyle = window.getComputedStyle(this.element.nativeElement);
    const initialAnimationName = initialStyle.animationName;
    const initialTransitionProperty = initialStyle.transitionProperty;

    this.animationState.set('exit');
    this.changeDetector.detectChanges();

    return new Promise(resolve => {
      // check if there are any exit animations or transitions
      const computedStyle = window.getComputedStyle(this.element.nativeElement);
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
        if (event.target !== this.element.nativeElement) {
          return;
        }

        this.element.nativeElement.removeEventListener('transitionend', done);
        this.element.nativeElement.removeEventListener('animationend', done);

        // reset the animation state
        this.animationState.set('enter');
        this.changeDetector.markForCheck();

        resolve();
      };

      this.element.nativeElement.addEventListener('transitionend', done);
      this.element.nativeElement.addEventListener('animationend', done);
    });
  }
}
