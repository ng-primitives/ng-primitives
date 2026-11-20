import { createEnvironmentInjector, EnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgpOverlayRegistry } from 'ng-primitives/portal';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DrawerStackService } from './drawer-stack.service';
import { DrawerState } from './drawer-state';

const STACK_EVENT_TYPES = [
  'pointerdown',
  'pointermove',
  'pointerup',
  'pointercancel',
  'keydown',
  'focusin',
  'click',
] as const;

describe('DrawerStackService', () => {
  let releaseRegistryEntry: (() => void) | undefined;

  afterEach(() => {
    releaseRegistryEntry?.();
    releaseRegistryEntry = undefined;
    TestBed.resetTestingModule();
    vi.restoreAllMocks();
  });

  it('is inert until the first state and shares one listener set across states', () => {
    const stack = createStack();
    releaseRegistryEntry = pinRegistryListeners();
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');

    expect(stackRegistrations(addEventListener)).toEqual([]);

    const states = Array.from({ length: 10 }, () => fakeState());
    for (const state of states) {
      stack.activate(state);
    }
    const registrations = stackRegistrations(addEventListener);
    expect(registrations.map(([type]) => type)).toEqual(STACK_EVENT_TYPES);

    for (const state of states.slice(0, -1)) {
      stack.deactivate(state);
    }
    expect(stackRemovals(removeEventListener)).toEqual([]);

    stack.deactivate(states.at(-1)!);
    expectExactRemovals(registrations, removeEventListener);
  });

  it('keeps listeners while click suppression is armed and removes them when consumed', () => {
    const stack = createStack();
    releaseRegistryEntry = pinRegistryListeners();
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    const state = fakeState();

    stack.activate(state);
    const registrations = stackRegistrations(addEventListener);
    stack.suppressNextClick();
    stack.deactivate(state);
    expect(stackRemovals(removeEventListener)).toEqual([]);

    const click = new MouseEvent('click', { cancelable: true });
    document.dispatchEvent(click);

    expect(click.defaultPrevented).toBe(true);
    expectExactRemovals(registrations, removeEventListener);
  });

  it('attaches immediately for suppression and disarms it on a fresh pointerdown', () => {
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    const stack = createStack();

    stack.suppressNextClick();
    const registrations = stackRegistrations(addEventListener);
    expect(registrations.map(([type]) => type)).toEqual(STACK_EVENT_TYPES);

    document.dispatchEvent(pointerEvent('pointerdown', 1));
    expectExactRemovals(registrations, removeEventListener);
  });

  it('destroys the exact callbacks and capture options once', () => {
    releaseRegistryEntry = pinRegistryListeners();
    const addEventListener = vi.spyOn(document, 'addEventListener');
    const removeEventListener = vi.spyOn(document, 'removeEventListener');
    const injector = createEnvironmentInjector(
      [DrawerStackService],
      TestBed.inject(EnvironmentInjector),
    );
    const stack = injector.get(DrawerStackService);
    stack.activate(fakeState());
    const registrations = stackRegistrations(addEventListener);

    injector.destroy();
    expectExactRemovals(registrations, removeEventListener);
    expect(stackRemovals(removeEventListener)).toHaveLength(STACK_EVENT_TYPES.length);
  });
});

function createStack(): DrawerStackService {
  TestBed.configureTestingModule({ providers: [DrawerStackService] });
  return TestBed.inject(DrawerStackService);
}

function fakeState(): DrawerState {
  return {
    modal: () => false,
    activeTrigger: () => null,
    popup: () => null,
    viewport: () => null,
    backdrop: () => null,
    requestOpen: () => false,
  } as unknown as DrawerState;
}

/**
 * The drawer stack registers every active drawer in the shared overlay registry, which attaches
 * its own capture-phase document listeners for the first entry. Keeping one unrelated entry
 * registered for the duration of a test means those listeners are already in place, so the spies
 * only observe the listeners owned by the drawer stack.
 */
function pinRegistryListeners(): () => void {
  const registry = TestBed.inject(NgpOverlayRegistry);
  const id = 'drawer-stack-test-entry';
  registry.register({
    id,
    parentId: null,
    overlay: { hide: () => undefined, hideImmediate: () => undefined },
    getElements: () => [],
    triggerElement: document.body,
    dismissPolicy: { outsidePress: false, escapeKey: false },
  });
  return () => registry.deregister(id);
}

function pointerEvent(type: string, pointerId: number): PointerEvent {
  const event = new MouseEvent(type, { bubbles: true, button: 0 }) as PointerEvent;
  Object.defineProperties(event, {
    isPrimary: { value: true },
    pointerId: { value: pointerId },
  });
  return event;
}

function stackRegistrations(
  spy: ReturnType<typeof vi.spyOn>,
): Parameters<Document['addEventListener']>[] {
  return spy.mock.calls.filter(
    ([type, , options]) =>
      STACK_EVENT_TYPES.includes(type as (typeof STACK_EVENT_TYPES)[number]) && options === true,
  ) as Parameters<Document['addEventListener']>[];
}

function stackRemovals(
  spy: ReturnType<typeof vi.spyOn>,
): Parameters<Document['removeEventListener']>[] {
  return spy.mock.calls.filter(
    ([type, , options]) =>
      STACK_EVENT_TYPES.includes(type as (typeof STACK_EVENT_TYPES)[number]) && options === true,
  ) as Parameters<Document['removeEventListener']>[];
}

function expectExactRemovals(
  registrations: Parameters<Document['addEventListener']>[],
  removeEventListener: ReturnType<typeof vi.spyOn>,
): void {
  for (const [type, listener, options] of registrations) {
    expect(options).toBe(true);
    expect(removeEventListener).toHaveBeenCalledWith(type, listener, options);
  }
}
