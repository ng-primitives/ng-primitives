import { DestroyRef, inject } from '@angular/core';

/**
 * Disposable functions are a way to manage timers, intervals, and event listeners
 * that should be cleared when a component is destroyed.
 *
 * Each disposable releases its DestroyRef registration as soon as the resource
 * is gone (the timer fires or the returned cleanup runs), so repeated calls -
 * e.g. rescheduling a timeout on every pointermove - don't accumulate destroy
 * callbacks for the lifetime of the host.
 *
 * This is heavily inspired by Headless UI disposables:
 * https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/src/utils/disposables.ts
 */
export function injectDisposables() {
  const destroyRef = inject(DestroyRef);
  let isDestroyed = false;

  destroyRef.onDestroy(() => (isDestroyed = true));

  return {
    /**
     * Set a timeout that will be cleared when the component is destroyed.
     * @param callback The callback to execute
     * @param delay The delay before the callback is executed
     * @returns A function to clear the timeout
     */
    setTimeout: (callback: () => void, delay: number) => {
      if (isDestroyed) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
      }

      const id = setTimeout(() => {
        unregister();
        callback();
      }, delay);
      const unregister = destroyRef.onDestroy(() => clearTimeout(id));
      return () => {
        clearTimeout(id);
        unregister();
      };
    },
    /**
     * Add an event listener that will be removed when the component is destroyed.
     * @param target The event target
     * @param type The event type
     * @param listener The event listener
     * @param options The event listener options
     * @returns A function to remove the event listener
     */
    addEventListener: <K extends keyof HTMLElementEventMap>(
      target: EventTarget,
      type: K,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ) => {
      if (isDestroyed) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
      }

      target.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
      const unregister = destroyRef.onDestroy(() =>
        target.removeEventListener(type, listener as EventListenerOrEventListenerObject, options),
      );
      return () => {
        target.removeEventListener(type, listener as EventListenerOrEventListenerObject, options);
        unregister();
      };
    },
    /**
     * Set an interval that will be cleared when the component is destroyed.
     * @param callback The callback to execute
     * @param delay The delay between executions
     * @returns A function to clear the interval
     */
    setInterval: (callback: () => void, delay: number) => {
      if (isDestroyed) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
      }

      const id = setInterval(callback, delay);
      const unregister = destroyRef.onDestroy(() => clearInterval(id));
      return () => {
        clearInterval(id);
        unregister();
      };
    },
    /**
     * Set a requestAnimationFrame that will be cleared when the component is destroyed.
     * @param callback The callback to execute
     * @returns A function to clear the requestAnimationFrame
     */
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      if (isDestroyed) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return () => {};
      }

      const id = requestAnimationFrame(time => {
        unregister();
        callback(time);
      });
      const unregister = destroyRef.onDestroy(() => cancelAnimationFrame(id));
      return () => {
        cancelAnimationFrame(id);
        unregister();
      };
    },
  };
}
