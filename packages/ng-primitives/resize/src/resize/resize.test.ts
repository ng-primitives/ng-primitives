import { Component } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import { NgpResize } from './resize';

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

describe('NgpResize', () => {
  let originalResizeObserver: typeof ResizeObserver;

  beforeEach(() => {
    originalResizeObserver = window.ResizeObserver;
    MockResizeObserver.instances = [];
    (window as typeof window & { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    (window as typeof window & { ResizeObserver: typeof ResizeObserver }).ResizeObserver =
      originalResizeObserver;
  });

  it('should emit ngpResize with dimensions when element resizes', async () => {
    const spy = vi.fn();

    @Component({
      template: `
        <div (ngpResize)="onResize($event)" data-testid="target">content</div>
      `,
      imports: [NgpResize],
    })
    class TestComponent {
      onResize = spy;
    }

    await render(TestComponent);

    const observer = MockResizeObserver.instances[0];
    expect(observer).toBeDefined();
    expect(observer.observedElements.length).toBe(1);

    observer.trigger([
      {
        borderBoxSize: [{ inlineSize: 200, blockSize: 100 }] as ResizeObserverSize[],
        contentBoxSize: [] as ResizeObserverSize[],
        contentRect: {} as DOMRectReadOnly,
        devicePixelContentBoxSize: [] as ResizeObserverSize[],
        target: screen.getByTestId('target'),
      },
    ]);

    expect(spy).toHaveBeenCalledWith({ width: 200, height: 100 });
  });

  it('should clean up observer on destroy', async () => {
    @Component({
      template: `
        <div (ngpResize)="onResize($event)">content</div>
      `,
      imports: [NgpResize],
    })
    class TestComponent {
      onResize = vi.fn();
    }

    const { fixture } = await render(TestComponent);

    const observer = MockResizeObserver.instances[0];
    expect(observer).toBeDefined();

    const disconnectSpy = vi.spyOn(observer, 'disconnect');

    fixture.destroy();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('should observe the host element', async () => {
    @Component({
      template: `
        <div (ngpResize)="onResize($event)" data-testid="target">content</div>
      `,
      imports: [NgpResize],
    })
    class TestComponent {
      onResize = vi.fn();
    }

    await render(TestComponent);

    const observer = MockResizeObserver.instances[0];
    expect(observer.observedElements.length).toBe(1);
    expect(observer.observedElements[0]).toBe(screen.getByTestId('target'));
  });
});
