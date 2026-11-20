import { Component, ElementRef, inject, runInInjectionContext, signal } from '@angular/core';
import { render, waitFor } from '@testing-library/angular';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fromMutationObserver } from '../mutation-observer';

describe('fromMutationObserver', () => {
  afterEach(() => vi.restoreAllMocks());
  @Component({ template: '' })
  class TestComponent {
    readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    readonly disabled = signal(false);
  }

  it('should deliver a single append once after the initial effect', async () => {
    const { fixture } = await render(TestComponent);
    const callback = vi.fn();
    const subscription = runInInjectionContext(fixture.debugElement.injector, () =>
      fromMutationObserver(fixture.componentInstance.element, { childList: true }).subscribe(
        callback,
      ),
    );
    await fixture.whenStable();

    fixture.componentInstance.element.appendChild(document.createElement('div'));
    await waitFor(() => expect(callback).toHaveBeenCalled());

    expect(callback).toHaveBeenCalledOnce();
    subscription.unsubscribe();
  });

  it('should observe once after enabling, disabling and re-enabling', async () => {
    const { fixture } = await render(TestComponent);
    const { element, disabled } = fixture.componentInstance;
    disabled.set(true);
    const observe = vi.spyOn(MutationObserver.prototype, 'observe');
    const callback = vi.fn();
    const subscription = runInInjectionContext(fixture.debugElement.injector, () =>
      fromMutationObserver(element, { childList: true, disabled }).subscribe(callback),
    );
    await fixture.whenStable();
    element.appendChild(document.createElement('div'));
    await Promise.resolve();
    expect(observe).not.toHaveBeenCalled();
    expect(callback).not.toHaveBeenCalled();

    disabled.set(false);
    await fixture.whenStable();
    element.appendChild(document.createElement('div'));
    await waitFor(() => expect(callback).toHaveBeenCalledOnce());

    disabled.set(true);
    await fixture.whenStable();
    element.appendChild(document.createElement('div'));
    await Promise.resolve();
    expect(callback).toHaveBeenCalledOnce();

    disabled.set(false);
    await fixture.whenStable();
    element.appendChild(document.createElement('div'));
    await waitFor(() => expect(callback).toHaveBeenCalledTimes(2));
    expect(observe.mock.calls.filter(([target]) => target === element)).toHaveLength(2);
    subscription.unsubscribe();
    observe.mockRestore();
  });

  it('should keep separate subscriptions independent', async () => {
    const { fixture } = await render(TestComponent);
    const first = vi.fn();
    const second = vi.fn();
    const source = fromMutationObserver(fixture.componentInstance.element, {
      childList: true,
      injector: fixture.debugElement.injector,
    });
    const firstSubscription = source.subscribe(first);
    const secondSubscription = source.subscribe(second);
    await fixture.whenStable();

    fixture.componentInstance.element.appendChild(document.createElement('div'));
    await waitFor(() => expect(second).toHaveBeenCalledOnce());
    expect(first).toHaveBeenCalledOnce();

    firstSubscription.unsubscribe();
    fixture.componentInstance.element.appendChild(document.createElement('div'));
    await waitFor(() => expect(second).toHaveBeenCalledTimes(2));
    expect(first).toHaveBeenCalledOnce();
    secondSubscription.unsubscribe();
  });

  it('should not resurrect observation after unsubscribe and disabled changes', async () => {
    const { fixture } = await render(TestComponent);
    const { element, disabled } = fixture.componentInstance;
    const callback = vi.fn();
    const observe = vi.spyOn(MutationObserver.prototype, 'observe');
    const subscription = runInInjectionContext(fixture.debugElement.injector, () =>
      fromMutationObserver(element, { childList: true, disabled }).subscribe(callback),
    );
    await fixture.whenStable();
    subscription.unsubscribe();

    disabled.set(true);
    await fixture.whenStable();
    disabled.set(false);
    await fixture.whenStable();
    element.appendChild(document.createElement('div'));
    await Promise.resolve();

    expect(callback).not.toHaveBeenCalled();
    expect(observe).toHaveBeenCalledOnce();
    observe.mockRestore();
  });
});
