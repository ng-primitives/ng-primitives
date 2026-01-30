import { Directive, OnDestroy } from '@angular/core';
import { injectElementRef } from '../utilities/element-ref';
import { injectExitAnimationManager } from './exit-animation-manager';

@Directive({
  selector: '[ngpExitAnimation]',
  exportAs: 'ngpExitAnimation',
})
export class NgpExitAnimation implements OnDestroy {
  /** The animation manager. */
  private readonly animationManager = injectExitAnimationManager();
  /** Access the element reference. */
  protected readonly elementRef = injectElementRef();

  /** Exist animation reference. */
  protected readonly ref = setupExitAnimation({ element: this.elementRef.nativeElement });

  constructor() {
    this.animationManager.add(this);
  }

  ngOnDestroy(): void {
    this.animationManager.remove(this);
  }

  /** Mark the element as exiting. */
  async exit(): Promise<void> {
    await this.ref.exit();
  }
}

interface NgpExitAnimationOptions {
  /** The element to animate. */
  element: HTMLElement;
  /** If true, skip requestAnimationFrame delay and set enter state immediately. */
  immediate?: boolean;
}

export interface NgpExitAnimationRef {
  /** Mark the element as exiting and wait for the animation to finish. */
  exit: () => Promise<void>;
}

export function setupExitAnimation({
  element,
  immediate,
}: NgpExitAnimationOptions): NgpExitAnimationRef {
  let state: 'enter' | 'exit' = 'enter';

  function setState(newState: 'enter' | 'exit') {
    state = newState;

    // remove all current animation state attributes
    element.removeAttribute('data-enter');
    element.removeAttribute('data-exit');

    // add the new animation state attribute
    if (state === 'enter') {
      element.setAttribute('data-enter', '');
    } else if (state === 'exit') {
      element.setAttribute('data-exit', '');
    }
  }

  // Set the initial state to 'enter' - immediately if instant, otherwise next frame
  if (immediate) {
    setState('enter');
  } else {
    requestAnimationFrame(() => setState('enter'));
  }

  return {
    exit: () => {
      return new Promise((resolve, reject) => {
        setState('exit');

        const animations = element.getAnimations();

        // Wait for the exit animations to finish
        if (animations.length > 0) {
          Promise.all(animations.map(anim => anim.finished))
            .then(() => resolve())
            .catch(err => {
              // AbortError is expected when element is removed during animation
              // e.g. when the user navigates away to another page
              if (err instanceof Error && err.name === 'AbortError') {
                resolve();
              } else {
                reject(err);
              }
            });
        } else {
          resolve();
        }
      });
    },
  };
}
