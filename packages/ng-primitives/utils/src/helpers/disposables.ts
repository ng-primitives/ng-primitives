import { DestroyRef, inject } from '@angular/core';

/**
 * Disposable functions are a way to manage timers, intervals, and event listeners
 * that should be cleared when a component is destroyed.
 *
 * This is heavily inspired by Headless UI disposables:
 * https://github.com/tailwindlabs/headlessui/blob/main/packages/%40headlessui-react/src/utils/disposables.ts
 */
export function injectDisposables() {
  const destroyRef = inject(DestroyRef);

  return {
    /**
     * Set a timeout that will be cleared when the component is destroyed.
     * @param callback The callback to execute
     * @param delay The delay before the callback is executed
     * @returns A function to clear the timeout
     */
    setTimeout: (callback: () => void, delay: number) => {
      const id = setTimeout(callback, delay);
      const cleanup = () => clearTimeout(id);
      destroyRef.onDestroy(cleanup);
      return cleanup;
    },
    /**
     * Set an interval that will be cleared when the component is destroyed.
     * @param callback The callback to execute
     * @param delay The delay before the callback is executed
     * @param target
     * @param type
     * @param listener
     * @param options
     * @returns A function to clear the interval
     */
    addEventListener: <K extends keyof HTMLElementEventMap>(
      target: EventTarget,
      type: K,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ) => {
      target.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
      const cleanup = () =>
        target.removeEventListener(type, listener as EventListenerOrEventListenerObject, options);
      destroyRef.onDestroy(cleanup);
      return cleanup;
    },
    /**
     * Set an interval that will be cleared when the component is destroyed.
     * @param callback The callback to execute
     * @param delay The delay before the callback is executed
     * @returns A function to clear the interval
     */
    setInterval: (callback: () => void, delay: number) => {
      const id = setInterval(callback, delay);
      const cleanup = () => clearInterval(id);
      destroyRef.onDestroy(cleanup);
      return cleanup;
    },
    /**
     * Set a requestAnimationFrame that will be cleared when the component is destroyed.
     * @param callback The callback to execute
     * @returns A function to clear the requestAnimationFrame
     */
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      const id = requestAnimationFrame(callback);
      const cleanup = () => cancelAnimationFrame(id);
      destroyRef.onDestroy(cleanup);
      return cleanup;
    },
  };
}
