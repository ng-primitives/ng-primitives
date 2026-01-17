import { isPlatformBrowser } from '@angular/common';
import {
  afterRenderEffect,
  effect,
  EffectCleanupRegisterFn,
  inject,
  PLATFORM_ID,
  signal,
  Signal,
} from '@angular/core';

/**
 * An isomorphic version of `afterRenderEffect` that works on both browser and server.
 *
 * On the browser, it delegates to the native `afterRenderEffect`.
 * On the server, `afterRenderEffect` doesn't run, so we execute all phases synchronously
 * within an `effect` to ensure content is rendered in the HTML for SSR.
 */
export function isomorphicRenderEffect<E = never, W = never, M = never>(
  ...args: Parameters<typeof afterRenderEffect<E, W, M>>
): void {
  if (isPlatformBrowser(inject(PLATFORM_ID))) {
    afterRenderEffect<E, W, M>(...args);
  } else {
    // On the server, afterRenderEffect doesn't run. For SSR we need to execute
    // the phases synchronously to ensure content is rendered in the HTML.
    effect(onCleanup => {
      const [specOrCallback] = args;

      // Handle simple callback case (runs during mixedReadWrite phase)
      if (typeof specOrCallback === 'function') {
        (specOrCallback as (onCleanup: EffectCleanupRegisterFn) => void)(onCleanup);
        return;
      }

      // Handle spec object with phases: earlyRead → write → mixedReadWrite → read
      // Each phase receives a signal wrapping the previous phase's result.
      // We use type assertions here because the complex conditional types Angular uses
      // are designed for runtime behavior we're simulating on the server.
      const spec = specOrCallback as {
        earlyRead?: (onCleanup: EffectCleanupRegisterFn) => E;
        write?: (prev: Signal<E>, onCleanup: EffectCleanupRegisterFn) => W;
        mixedReadWrite?: (prev: Signal<W | E>, onCleanup: EffectCleanupRegisterFn) => M;
        read?: (prev: Signal<M | W | E>, onCleanup: EffectCleanupRegisterFn) => void;
      };

      let lastResult: E | W | M | undefined;

      if (spec.earlyRead) {
        lastResult = spec.earlyRead(onCleanup);
      }

      if (spec.write) {
        const prevSignal = signal(lastResult as E);
        lastResult = spec.write(prevSignal, onCleanup);
      }

      if (spec.mixedReadWrite) {
        const prevSignal = signal(lastResult as W | E);
        lastResult = spec.mixedReadWrite(prevSignal, onCleanup);
      }

      if (spec.read) {
        const prevSignal = signal(lastResult as M | W | E);
        spec.read(prevSignal, onCleanup);
      }
    });
  }
}
