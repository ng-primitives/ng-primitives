import { ElementRef, signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive } from 'ng-primitives/state';

export interface NgpMenuTriggerGroupState {
  /**
   * The group's host element - the shared container a root NgpMenuTrigger
   * suppresses pointer-events on while a sibling's hover-bridge is active.
   * @internal
   */
  readonly element: ElementRef<HTMLElement>;
  /** @internal */
  setTransitSource(trigger: HTMLElement): void;
  /** @internal */
  clearTransitSource(trigger: HTMLElement): void;
  /** @internal */
  isTransitBlocked(trigger: HTMLElement): boolean;
}

export interface NgpMenuTriggerGroupProps {}

export const [
  NgpMenuTriggerGroupStateToken,
  ngpMenuTriggerGroup,
  injectMenuTriggerGroupState,
  provideMenuTriggerGroupState,
] = createPrimitive('NgpMenuTriggerGroup', (_: NgpMenuTriggerGroupProps) => {
  const element = injectElementRef<HTMLElement>();
  const transitSource = signal<HTMLElement | null>(null);

  function setTransitSource(trigger: HTMLElement): void {
    transitSource.set(trigger);
  }

  function clearTransitSource(trigger: HTMLElement): void {
    // Only the trigger that claimed the transit may release it, so a newer
    // corridor isn't cleared by an older one tearing down.
    if (transitSource() === trigger) {
      transitSource.set(null);
    }
  }

  function isTransitBlocked(trigger: HTMLElement): boolean {
    const source = transitSource();
    return source !== null && source !== trigger;
  }

  return {
    element,
    setTransitSource,
    clearTransitSource,
    isTransitBlocked,
  } satisfies NgpMenuTriggerGroupState;
});
