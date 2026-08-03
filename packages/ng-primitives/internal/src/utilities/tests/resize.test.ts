import { Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fromResizeEvent } from '../resize';

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];
  callback: ResizeObserverCallback;
  observedElements: Element[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  observe(target: Element) {
    this.observedElements.push(target);
  }

  unobserve(target: Element) {
    this.observedElements = this.observedElements.filter(el => el !== target);
  }

  disconnect() {
    this.observedElements = [];
  }

  trigger(entries: Partial<ResizeObserverEntry>[]) {
    this.callback(entries as ResizeObserverEntry[], this as unknown as ResizeObserver);
  }
}

/**
 * Counts the layout-invalidating reads a block of code performs on an element.
 *
 * `offsetWidth`/`offsetHeight`/`getBoundingClientRect` force the browser to
 * flush pending layout, and `getComputedStyle` forces style resolution. Doing
 * any of them while the framework is still creating elements interleaves reads
 * with writes, so the cost is paid once per element instead of once per frame.
 */
function countLayoutReads(element: HTMLElement, run: () => void): number {
  let reads = 0;

  const offsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
  const offsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
  const originalGetBoundingClientRect = element.getBoundingClientRect.bind(element);
  const originalGetComputedStyle = window.getComputedStyle;

  Object.defineProperty(element, 'offsetWidth', {
    configurable: true,
    get() {
      reads++;
      return offsetWidth!.get!.call(this);
    },
  });
  Object.defineProperty(element, 'offsetHeight', {
    configurable: true,
    get() {
      reads++;
      return offsetHeight!.get!.call(this);
    },
  });
  element.getBoundingClientRect = () => {
    reads++;
    return originalGetBoundingClientRect();
  };
  window.getComputedStyle = ((...args: Parameters<typeof originalGetComputedStyle>) => {
    reads++;
    return originalGetComputedStyle(...args);
  }) as typeof originalGetComputedStyle;

  try {
    run();
  } finally {
    Reflect.deleteProperty(element, 'offsetWidth');
    Reflect.deleteProperty(element, 'offsetHeight');
    element.getBoundingClientRect = originalGetBoundingClientRect;
    window.getComputedStyle = originalGetComputedStyle;
  }

  return reads;
}

describe('fromResizeEvent', () => {
  let originalResizeObserver: typeof ResizeObserver;
  let element: HTMLElement;
  let injector: Injector;

  beforeEach(() => {
    originalResizeObserver = window.ResizeObserver;
    MockResizeObserver.instances = [];
    (window as typeof window & { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;

    TestBed.configureTestingModule({});
    injector = TestBed.inject(Injector);

    element = document.createElement('div');
    element.style.width = '120px';
    element.style.height = '40px';
    document.body.appendChild(element);
  });

  afterEach(() => {
    (window as typeof window & { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
      originalResizeObserver;
    element.remove();
  });

  it('should not force a synchronous layout read when the observer is created', () => {
    const reads = countLayoutReads(element, () => {
      fromResizeEvent(element, { injector }).subscribe();
    });

    expect(reads).toBe(0);
  });

  it('should emit an initial measurement before the next paint, but not during construction', async () => {
    const emissions: { width: number; height: number }[] = [];

    fromResizeEvent(element, { injector }).subscribe(dimensions => emissions.push(dimensions));

    // Nothing measured yet — the caller is still building the DOM.
    expect(emissions).toHaveLength(0);

    // A microtask still runs before the browser paints, so the measurement is no
    // less timely than a synchronous read.
    await Promise.resolve();

    expect(emissions).toEqual([{ width: 120, height: 40 }]);
  });

  it('should emit measurements from the observer callback', () => {
    const emissions: { width: number; height: number }[] = [];

    fromResizeEvent(element, { injector }).subscribe(dimensions => emissions.push(dimensions));

    MockResizeObserver.instances[0].trigger([
      { borderBoxSize: [{ inlineSize: 200, blockSize: 60 }] },
    ]);

    expect(emissions).toEqual([{ width: 200, height: 60 }]);
  });

  it('should measure from the observer entry rather than re-reading layout', () => {
    fromResizeEvent(element, { injector }).subscribe();

    const reads = countLayoutReads(element, () => {
      MockResizeObserver.instances[0].trigger([
        { borderBoxSize: [{ inlineSize: 120, blockSize: 40 }] },
      ]);
    });

    expect(reads).toBe(0);
  });

  it('should not create an observer while disabled', () => {
    const reads = countLayoutReads(element, () => {
      fromResizeEvent(element, { disabled: signal(true), injector }).subscribe();
    });

    expect(MockResizeObserver.instances).toHaveLength(0);
    expect(reads).toBe(0);
  });
});
