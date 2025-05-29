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
  async exit(): Promise<void> {
    await Promise.all(this.instances.map(instance => instance.exit()));
  }
}

export function provideExitAnimationManager(): ClassProvider {
  return { provide: NgpExitAnimationManager, useClass: NgpExitAnimationManager };
}

export function injectExitAnimationManager(): NgpExitAnimationManager {
  return inject(NgpExitAnimationManager);
}
