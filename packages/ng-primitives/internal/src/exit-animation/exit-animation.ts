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
  /** Cancel an in-progress exit animation and transition back to enter state. */
  cancel: () => void;
  /** End an in-progress exit animation now, leaving the element on its way out. */
  finish: () => void;
}

/**
 * Buffer (ms) added to the longest animation's own computed duration when arming
 * the fallback timeout, so the timeout only fires once the animation should have
 * finished but `finished` failed to settle. Matches the native `animate.leave`
 * class runner's `longest.duration + 50`.
 */
const EXIT_ANIMATION_FALLBACK_BUFFER = 50;

/** Whether an animation repeats forever, and so will never resolve `finished`. */
function isInfinite(animation: Animation): boolean {
  return animation.effect?.getComputedTiming().iterations === Infinity;
}

/**
 * The defensive fallback delay for a set of exit animations: the longest
 * animation's own end time plus a small buffer. Used only as a safety net - if
 * `finished` (the authoritative signal) never settles, teardown still proceeds
 * shortly after the animation should have ended. Derived from each animation's
 * declared timing, so a healthy long animation is never cut short. Mirrors
 * native's CSS `animate.leave` fallback (`longest.duration + 50`, uncapped).
 */
function exitAnimationFallbackTimeout(animations: Animation[]): number {
  let longest = 0;
  for (const animation of animations) {
    const endTime = animation.effect?.getComputedTiming().endTime;
    if (typeof endTime === 'number' && Number.isFinite(endTime)) {
      longest = Math.max(longest, endTime);
    }
  }
  return longest + EXIT_ANIMATION_FALLBACK_BUFFER;
}

export function setupExitAnimation({
  element,
  immediate,
}: NgpExitAnimationOptions): NgpExitAnimationRef {
  let state: 'enter' | 'exit' = 'enter';
  let exitResolve: (() => void) | null = null;
  let exitTimeout: ReturnType<typeof setTimeout> | null = null;

  // Whether this environment can actually run and observe CSS animations. On the
  // server (or any non-DOM environment) there is nothing to animate or wait for,
  // so enter/exit collapse to synchronous attribute toggles.
  const canAnimate = typeof element.getAnimations === 'function';

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

  function clearExitTimeout() {
    if (exitTimeout !== null) {
      clearTimeout(exitTimeout);
      exitTimeout = null;
    }
  }

  // Set the initial state to 'enter' - immediately if instant or if there is no
  // `requestAnimationFrame` to defer to (e.g. server-side rendering), otherwise
  // next frame so the browser registers the "from" state and plays the enter
  // transition.
  if (immediate || typeof requestAnimationFrame !== 'function') {
    setState('enter');
  } else {
    requestAnimationFrame(() => setState('enter'));
  }

  return {
    exit: () => {
      return new Promise<void>(resolve => {
        exitResolve = resolve;
        setState('exit');

        const settle = () => {
          // Only the currently active cycle may clear the shared timeout/resolver.
          // `cancel()` rejects the running animations' `finished` promises
          // asynchronously (AbortError), so a superseded cycle's `settle()` can
          // fire after a new exit() has started on the same ref (exit → cancel →
          // exit, via the portal's cancelDetach). A stale settle() must not clear
          // the new cycle's fallback timer or null its resolver.
          if (exitResolve === resolve) {
            clearExitTimeout();
            exitResolve = null;
          }
          resolve();
        };

        // Nothing to wait for when the environment can't run animations.
        if (!canAnimate) {
          settle();
          return;
        }

        // Only wait for animations that will actually finish. Infinite
        // animations (e.g. a spinner or pulse on the element) never resolve
        // their `finished` promise, so waiting on them would leave the element
        // - and any overlay it belongs to - stuck on screen forever.
        const animations = element.getAnimations().filter(animation => !isInfinite(animation));

        // No finite exit animation - remove immediately.
        if (animations.length === 0) {
          settle();
          return;
        }

        // Defensive fallback: `finished` is the authoritative signal, but if it
        // never settles (a paused/stuck animation, or a browser quirk) teardown
        // must still proceed. Mirrors the native `animate.leave` fallback timeout.
        exitTimeout = setTimeout(settle, exitAnimationFallbackTimeout(animations));

        // Resolve - never reject - once every finite animation settles. A
        // rejected exit would propagate through `detach()` and leave the overlay
        // in the DOM forever, so errors (including the AbortError raised when the
        // element is removed mid-animation) resolve exactly like success.
        Promise.allSettled(animations.map(anim => anim.finished)).then(settle);
      });
    },
    finish: () => {
      if (state !== 'exit') {
        return;
      }

      clearExitTimeout();

      // Jump to the animation's end state rather than cancelling: the element is
      // leaving, and cancel() would snap it back to how it looked before the
      // exit began for however long it takes the caller to remove it. Infinite
      // animations are skipped - `finish()` throws on them, and `exit()` never
      // waited on them in the first place.
      const animations = canAnimate ? element.getAnimations() : [];
      for (const animation of animations) {
        if (isInfinite(animation)) {
          continue;
        }
        try {
          animation.finish();
        } catch {
          // `finish()` also throws on a paused-at-rate-zero animation, which
          // nothing here creates but a consumer can. Resolving the exit matters
          // more than the frame it ends on - throwing past the resolve below
          // would strand the detach this exists to unstick.
        }
      }

      if (exitResolve) {
        exitResolve();
        exitResolve = null;
      }
    },
    cancel: () => {
      if (state === 'exit') {
        clearExitTimeout();
        // Cancel any running animations
        const animations = canAnimate ? element.getAnimations() : [];
        for (const anim of animations) {
          anim.cancel();
        }
        // Transition back to enter state
        setState('enter');
        // Resolve the pending exit promise so detach() completes
        if (exitResolve) {
          exitResolve();
          exitResolve = null;
        }
      }
    },
  };
}
