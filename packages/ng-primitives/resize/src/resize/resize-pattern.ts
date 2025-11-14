import {
  DestroyRef,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  NgZone,
  Type,
} from '@angular/core';
import { Dimensions, fromResizeEvent, injectElementRef } from 'ng-primitives/internal';
import { safeTakeUntilDestroyed } from 'ng-primitives/utils';

/**
 * The state interface for the Resize pattern.
 */
export interface NgpResizeState {
  // Define state properties and methods
}

/**
 * The props interface for the Resize pattern.
 */
export interface NgpResizeProps {
  /**
   * The element reference for the resize.
   */
  element?: ElementRef<HTMLElement>;
  /**
   * Event listener for didResize events.
   */
  readonly onDidResize?: (value: Dimensions) => void;
}

/**
 * The Resize pattern function.
 */
export function ngpResizePattern({
  element = injectElementRef(),
  onDidResize,
}: NgpResizeProps = {}): NgpResizeState {
  // Dependency injection
  const ngZone = inject(NgZone);
  const destroyRef = inject(DestroyRef);

  // Constructor logic
  // observe the element for resize events
  fromResizeEvent(element.nativeElement)
    .pipe(safeTakeUntilDestroyed(destroyRef))
    .subscribe(event => ngZone.run(() => onDidResize?.(event)));

  return {
    // Return state object
  };
}

/**
 * The injection token for the Resize pattern.
 */
export const NgpResizePatternToken = new InjectionToken<NgpResizeState>('NgpResizePatternToken');

/**
 * Injects the Resize pattern.
 */
export function injectResizePattern(): NgpResizeState {
  return inject(NgpResizePatternToken);
}

/**
 * Provides the Resize pattern.
 */
export function provideResizePattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpResizeState,
): FactoryProvider {
  return { provide: NgpResizePatternToken, useFactory: () => fn(inject(type)) };
}
