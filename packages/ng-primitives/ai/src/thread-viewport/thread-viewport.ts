import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, input, numberAttribute } from '@angular/core';
import { ngpThreadViewportPattern, provideThreadViewportPattern } from './thread-viewport-pattern';

@Directive({
  selector: '[ngpThreadViewport]',
  exportAs: 'ngpThreadViewport',
  providers: [provideThreadViewportPattern(NgpThreadViewport, instance => instance.pattern)],
})
export class NgpThreadViewport {
  /**
   * The distance in pixels from the bottom of the scrollable container that is considered "at the bottom".
   * When the user scrolls within this threshold, the thread is treated as being at the bottom.
   * This value is used to determine whether automatic scrolling to the bottom should occur,
   * for example when new content is added or the container is resized.
   *
   * @default 70
   */
  readonly threshold = input<number, NumberInput>(70, {
    alias: 'ngpThreadViewportThreshold',
    transform: numberAttribute,
  });

  /**
   * Whether the thread should automatically scroll to the bottom when new content is added.
   */
  readonly autoScroll = input<boolean, BooleanInput>(true, {
    alias: 'ngpThreadViewportAutoScroll',
    transform: booleanAttribute,
  });

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpThreadViewportPattern({
    threshold: this.threshold,
    autoScroll: this.autoScroll,
  });
}
