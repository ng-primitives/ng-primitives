import { ChangeDetectorRef, Directive, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { injectElementRef } from '../utilities/element-ref';

@Directive({
  selector: '[ngpExitAnimation]',
  exportAs: 'ngpExitAnimation',
  host: {
    '[attr.data-closing]': 'state() === "exit" ? "" : null',
  },
})
export class NgpExitAnimation implements OnDestroy {
  /** The animation manager. */
  private readonly animationManager = inject(NgpExitAnimationManager);
  /** The element to animate. */
  private readonly element = injectElementRef();
  /** Access the change detector. */
  private readonly changeDetector = inject(ChangeDetectorRef);

  /** The animation state */
  private readonly state = signal<'enter' | 'exit'>('enter');

  constructor() {
    this.animationManager.add(this);
  }

  ngOnDestroy(): void {
    this.animationManager.remove(this);
  }

  /** Mark the element as exiting. */
  exit(): Promise<void> {
    this.state.set('exit');
    this.changeDetector.detectChanges();
    return new Promise(resolve => {
      // check if there are any exit animations or transitions
      const computedStyle = window.getComputedStyle(this.element.nativeElement);
      const hasTransition = parseFloat(computedStyle.transitionDuration) > 0;
      const hasAnimation = parseFloat(computedStyle.animationDuration) > 0;

      if (!hasTransition && !hasAnimation) {
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
        resolve();
      };

      this.element.nativeElement.addEventListener('transitionend', done);
      this.element.nativeElement.addEventListener('animationend', done);
    });
  }
}

@Injectable()
export class NgpExitAnimationManager {
  /** Store the instances of the exit animation directive. */
  private readonly instances: NgpExitAnimation[] = [];

  /** Add an instance to the manager. */
  add(instance: NgpExitAnimation): void {
    this.instances.push(instance);
  }

  /** Remove an instance from the manager. */
  remove(instance: NgpExitAnimation): void {
    const index = this.instances.indexOf(instance);
    if (index !== -1) {
      this.instances.splice(index, 1);
    }
  }

  /** Exit all instances. */
  exit(): Promise<void[]> {
    const promises = this.instances.map(instance => instance.exit());
    return Promise.all(promises);
  }
}
