import { signal } from '@angular/core';
import {
  createDrawerHandle,
  NgpDrawerHandleController,
  setDrawerHandleController,
} from './handle/drawer-handle';

interface TestPayload {
  id: number;
}

function createController(id: number, calls: string[]): NgpDrawerHandleController<TestPayload> {
  const opened = signal(true);
  const payload = signal<TestPayload | undefined>({ id });

  return {
    opened,
    payload,
    open: value => calls.push(`open:${value?.id ?? 'none'}:${id}`),
    close: () => calls.push(`close:${id}`),
    toggle: () => calls.push(`toggle:${id}`),
    unmount: () => calls.push(`unmount:${id}`),
  };
}

describe('createDrawerHandle', () => {
  it('is a no-op before attach and after detach', () => {
    const handle = createDrawerHandle<{ id: number }>();
    expect(() => {
      handle.open({ id: 1 });
      handle.close();
      handle.toggle();
      handle.unmount();
    }).not.toThrow();
    expect(handle.opened()).toBe(false);
    expect(handle.payload()).toBeUndefined();
  });

  it('forwards actions only to the currently attached controller', () => {
    const handle = createDrawerHandle<{ id: number }>();
    const calls: unknown[][] = [];
    const detach = setDrawerHandleController(handle, {
      open: (...args) => calls.push(['open', ...args]),
      close: () => calls.push(['close']),
      toggle: () => calls.push(['toggle']),
      unmount: () => calls.push(['unmount']),
      opened: () => true,
      payload: () => ({ id: 4 }),
    });

    handle.open({ id: 2 }, 'trigger-a');
    handle.close();
    expect(handle.opened()).toBe(true);
    expect(handle.payload()).toEqual({ id: 4 });
    expect(calls).toEqual([['open', { id: 2 }, 'trigger-a'], ['close']]);

    detach();
    handle.toggle();
    expect(calls).toHaveLength(2);
  });

  it('restores the previous controller when the active attachment detaches', () => {
    const handle = createDrawerHandle<TestPayload>();
    const calls: string[] = [];
    const detachA = setDrawerHandleController(handle, createController(1, calls));
    const detachB = setDrawerHandleController(handle, createController(2, calls));

    expect(handle.opened()).toBe(true);
    expect(handle.payload()).toEqual({ id: 2 });
    handle.close();
    expect(calls).toEqual(['close:2']);

    detachB();
    expect(handle.payload()).toEqual({ id: 1 });
    handle.open({ id: 8 });
    expect(calls).toEqual(['close:2', 'open:8:1']);

    detachA();
    expect(handle.opened()).toBe(false);
    expect(handle.payload()).toBeUndefined();
  });

  it('keeps the active controller when an older attachment detaches', () => {
    const handle = createDrawerHandle<TestPayload>();
    const calls: string[] = [];
    const detachA = setDrawerHandleController(handle, createController(1, calls));
    const detachB = setDrawerHandleController(handle, createController(2, calls));

    detachA();
    detachA();
    handle.toggle();

    expect(handle.payload()).toEqual({ id: 2 });
    expect(calls).toEqual(['toggle:2']);

    detachB();
    expect(handle.opened()).toBe(false);
    expect(handle.payload()).toBeUndefined();
    handle.unmount();
    expect(calls).toHaveLength(1);
  });
});
