import { ClassProvider, inject, Injectable } from '@angular/core';
import type { NgpExitAnimation } from './exit-animation';

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
  exit(): Promise<void> {
    return new Promise((resolve, reject) => {
      const exitPromises = this.instances.map(instance => instance.exit());

      // Wait for all exit animations to finish
      Promise.all(exitPromises)
        .then(() => resolve())
        .catch(err => {
          if (err instanceof Error && err.name !== 'AbortError') {
            return reject(err);
          }
          // Ignore abort errors as they are expected when the animation is interrupted
          // by the removal of the element - e.g. when the user navigates away to another page
          resolve();
        });
    });
  }
}

export function provideExitAnimationManager(): ClassProvider {
  return { provide: NgpExitAnimationManager, useClass: NgpExitAnimationManager };
}

export function injectExitAnimationManager(): NgpExitAnimationManager {
  return inject(NgpExitAnimationManager);
}
