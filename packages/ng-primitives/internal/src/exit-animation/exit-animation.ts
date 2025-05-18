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
  async exit(): Promise<void> {
    this.setAnimationState('exit');

    const animation = this.elementRef.nativeElement.getAnimations();

    if (animation.length > 0) {
      // Wait for the exit animation to finish
      await Promise.all(animation.map(anim => anim.finished));
    }
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
      // make the element inert to prevent interaction while exiting
      this.renderer.setAttribute(this.elementRef.nativeElement, 'inert', '');
    }
  }
}
